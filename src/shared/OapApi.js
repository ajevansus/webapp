import DynamoDB from "aws-sdk/clients/dynamodb";
import {Credentials} from "aws-sdk/lib/core";

/*

we store data in 4 tables, although three of them (state tables) have the same structure
and exist only for optimising time-range queries.

state consists of "results" and "config", where the latter is subset of properties that can be set
by user. They may change over time.

oap_things {
    sensorId:string,
    name:string,
    enabled:boolean,
    location:{lat:number, lng:number},
    link:string,
    ...
}

oap_{last,hour,all} {
    sensorId:string,
    config: {
        indoor:boolean,
        test:number
    },
    localTime:number,
    serverTime:number,
    hourEpoch?:number,
    results?: {
        pm : {
            pm1_0:number,
            pm2_5:number,
            pm10:number,
            sensor:number
        },
        weather: {
            humidity:number,
            temp:number,
            pressure:number,
            sensor:number
        }
        ...
    }
}

*/

class DynamoDBConverter {

  static convert(ddb) {
    if (!ddb) return ddb;
    let result = {};
    for (let prop of Object.getOwnPropertyNames(ddb)) {
      result[prop] = DynamoDBConverter.convertAttribute(ddb[prop])
    }
    return result;
  }

  static convertAttribute(ddb) {
    if (!ddb) return ddb;

    //well it does not loop all right - each attribute should have exactly one of those fields.
    for (let prop of Object.getOwnPropertyNames(ddb)) {
      switch (prop) {
        case 'B'    :   // B: new Buffer('...') || 'STRING_VALUE'
        case 'BOOL' :   // BOOL: true || false,
        case 'BS'   :   // //   BS: [
                        //   new Buffer('...') || 'STRING_VALUE',
                        //   /* more items */
                        // ]
        // eslint-disable-next-line
        case 'S'    :   //   S: 'STRING_VALUE',
        case 'SS'    :  //   SS: [
                        //   'STRING_VALUE',
                        //   /* more items */
                        // ]

          return ddb[prop];

        case 'N'    :   // N: 'STRING_VALUE',
          return parseFloat(ddb.N);

        case 'NN'   :   //   NS: [
                        //   'STRING_VALUE',
                        //   /* more items */
                        // ],
          return ddb.NN.map(i => parseFloat(i));

        case 'NULL' :   //   NULL: true || false, (???????)
          return null;

        case 'L'    :   // L: [
                        //   /* recursive AttributeValue */,
                        //   /* more items */
                        // ],

          return  ddb.L.map(i => DynamoDBConverter.convertAttribute(i))

        case 'M'    :   //   M: {
                        //   someKey: /* recursive AttributeValue */,
                        //   /* anotherKey: ... */
                        // },
          return DynamoDBConverter.convert(ddb.M)

        default     :
          throw new Error('unknown attribute "'+prop+'" in '+JSON.stringify(ddb))
      }
    }
  }
}

class CacheEntry {
    constructor(data, expire) {
        this.data = data;
        this.expire = expire;
    }
  }

class Cache {
  cache = {};

  get(cacheKey, resolve) {
    let entry = this.cache[cacheKey];
    if (entry && (entry.expire < 0 || new Date().getTime() < entry.expire)) {
      resolve(entry.data);
      return true;
    } else {
      return false;
    }
  }

  put(cacheKey, data, ttl = -1) {
    this.cache[cacheKey] = new CacheEntry(data, ttl < 0 ? -1 : new Date().getTime() + ttl);
    return data;
  }

  remove(cacheKey) {
    delete this.cache[cacheKey];
  }

  clear() {
    this.cache = {};
  }
}

export class PmService {

  cache = new Cache();
  LATEST_RESULTS_THRESHOLD = 3*3600; // < 3h

  constructor() {
    let myCredentials = new Credentials('AKIAIQY2RXAQQI3AKMQA', 'X+9OYTnZFRVot74yonlNGGLAiJZWwykcutecbcea');
    this.db = new DynamoDB({
      credentials: myCredentials,
      region: 'eu-west-1',
      apiVersion: '2012-08-10',
      params: {}
    });
  }

  getSensors() {
    //we need to cheat a bit here, because config values are stored in state table and not in things table.
    return new Promise((resolve, reject) => {
        if (!this.cache.get("sensors", resolve)) {
            this.getLatestSensorsData().then((lastSensorData)=>{
                this.db.scan({TableName: 'oap_things'}, (err, sensorsRS) => {
                    if (err) {
                      reject(err)
                    } else {
                      let sensors = {};
                      let s,state;
                      sensorsRS.Items.forEach(sensor => {
                        s = DynamoDBConverter.convert(sensor);
                        state = lastSensorData[s.sensorId];
                        if (s.enabled && state) {
                            // defaultConfig < stateConfig < fixedConfig
                            s.config = Object.assign({test:1,indoor:false},state.config,s.config);
                            s.lastSeen = state.serverTime; //fixme
                            s.name = s.name || s.sensorId;
                            sensors[s.sensorId] = s;
                        }
                      });
                      console.debug("sensors",sensors);
                      resolve(this.cache.put("sensors",sensors));
                    }
                  })
            }, reject);
        }
    });
  }

  getSensor(sensorId) {
    return this.getSensors().then((sensors)=>sensors[sensorId]);
  }

  convertSensorData(sensorStatesRS) {
    let sensorStates = {}
    sensorStatesRS.Items.map(stateRS => DynamoDBConverter.convert(stateRS))
      .forEach((state) => {
        state.results.aqi = this.computeAQI(state);
        sensorStates[state.sensorId] = state;
      });
    return sensorStates;  
  }

  //TODO why do we need it? chart?
  getSensorData(query) {
    return new Promise((resolve, reject)=>{

      let queryParam = {
        TableName:'oap_all_2',
          KeyConditionExpression: "sensorId = :sensorId and ",
        ExpressionAttributeNames:{
        "#localTime": "localTime"
      },
        Limit:1000,
        ExpressionAttributeValues: {
          ":sensorId":{'S':query.sensorId},
          ":timeFrom":{'N':''+query.timeFrom}
        }
      };

      if (query.timeTo) {
        queryParam.KeyConditionExpression+="#localTime between :timeFrom and :timeTo";
        queryParam.ExpressionAttributeValues[':timeTo'] = {'N':''+query.timeTo};
      } else {
        queryParam.KeyConditionExpression+="#localTime >= :timeFrom";
      }

      this.db.query(queryParam, (err, data)=>{
          if (err) {
            reject(err);
          } else {
            resolve(data.Items.map(item => DynamoDBConverter.convert(item)));
          }
      });
    });
  }

  getLatestSensorsData() {
    return new Promise((resolve, reject) => {
        const cacheKey = "data_latest";
        if (this.cache.get(cacheKey,resolve)) return;
        console.debug("search latest");
        this.db.scan({TableName:'oap_last_2'}, (err, sensorStatesRS)=>{
            if (err) {
                reject(err);
            } else {
                resolve(this.cache.put(cacheKey, this.convertSensorData(sensorStatesRS), 60000 * 5)); //5 min
            }
        });
    });
  }

  getHourSensorsData(hourEpoch) {
    return new Promise((resolve, reject) => {
        const cacheKey = "data_hourEpoch_"+hourEpoch;
        if (this.cache.get(cacheKey,resolve)) return;
        console.debug("search hourEpoch:" + hourEpoch);
        this.db.query({
            TableName:'oap_hour_2',
            KeyConditionExpression: "#hourEpoch = :time",
            ExpressionAttributeNames:{
                "#hourEpoch": "hourEpoch"
            },
            ExpressionAttributeValues: {
                ":time":{'N':''+hourEpoch}
            }
            }, (err, sensorStatesRS)=>{
                if (err) {
                    reject(err);
                } else {
                    resolve(this.cache.put(cacheKey, this.convertSensorData(sensorStatesRS), 60000 * 60)); //60min
                }
            }
        );
    });
  }

  getAllSensorsData(query) {
      return new Promise((resolve, reject) => {
        if (!query || !query.time) {
            //filter out old results
            const now = Date.now()/1000;
            this.getLatestSensorsData().then((data)=>{
                let filtered = {}, thingState;
                Object.getOwnPropertyNames(data).forEach(sensorId=>{
                    thingState = data[sensorId];
                    if (now - thingState.localTime < this.LATEST_RESULTS_THRESHOLD) {
                        filtered[sensorId] = thingState;
                    }
                });
                resolve(filtered);
            }, reject);
        } else {
            this.getHourSensorsData(Math.floor(query.time.unix() / 3600)).then(resolve, reject);
        }
    })
  }

  computeAQI(thingState) {
    let val = thingState.results.pm.pm2_5;
    let aqi = Math.max(0, Math.min(9, Math.floor(val / 5))); // 0 - 9, 100%pm2.5 = 5
    return aqi
  }

}

let pmService = new PmService();
export default pmService;