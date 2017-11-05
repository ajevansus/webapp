
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

function status(response) {
  if (response.status >= 200 && response.status < 300) {
    return Promise.resolve(response)
  } else {
    return Promise.reject(new Error(response.statusText))
  }
}

function json(response) {
  return response.json()
}

function computeAQI(thingState) {
  let val = thingState.results.pm.pm2_5;
  let aqi = Math.max(0, Math.min(9, Math.floor(val / 5))); // 0 - 9, 100%pm2.5 = 5
  return aqi
}

function mapStateToSensor(response) {
  var result = {};
  response.state.forEach(state=>{
    state.results.aqi = computeAQI(state);
    result[state.sensorId] = state;
  });
  return result;
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

const API_URL = "https://f3kwdjctn5.execute-api.eu-west-1.amazonaws.com/prod";

export class PmService {

  cache = new Cache();
  LATEST_RESULTS_THRESHOLD = 3*3600; // < 3h

  getSensors() {
    //we need to cheat a bit here, because config values are stored in state table and not in things table.
    return new Promise((resolve, reject) => {
        if (!this.cache.get("sensors", resolve)) {
            this.getLatestSensorsData().then((lastSensorData)=>{
              fetch(API_URL+"/sensors")
              .then(status)
              .then(json)
              .then((data)=>{
                let sensors = {};
                data.sensors.forEach(s => {
                  let state = lastSensorData[s.sensorId];
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
              }).catch(reject);
        }).catch(reject);
      }
    });
  }

  getSensor(sensorId) {
    return this.getSensors().then((sensors)=>sensors[sensorId]);
  }

  //TODO why do we need it? chart?
  getSensorData(query) {
    // return new Promise((resolve, reject)=>{

    //   let queryParam = {
    //     TableName:'oap_all_2',
    //       KeyConditionExpression: "sensorId = :sensorId and ",
    //     ExpressionAttributeNames:{
    //     "#localTime": "localTime"
    //   },
    //     Limit:1000,
    //     ExpressionAttributeValues: {
    //       ":sensorId":{'S':query.sensorId},
    //       ":timeFrom":{'N':''+query.timeFrom}
    //     }
    //   };

    //   if (query.timeTo) {
    //     queryParam.KeyConditionExpression+="#localTime between :timeFrom and :timeTo";
    //     queryParam.ExpressionAttributeValues[':timeTo'] = {'N':''+query.timeTo};
    //   } else {
    //     queryParam.KeyConditionExpression+="#localTime >= :timeFrom";
    //   }

    //   this.db.query(queryParam, (err, data)=>{
    //       if (err) {
    //         reject(err);
    //       } else {
    //         resolve(data.Items.map(item => DynamoDBConverter.convert(item)));
    //       }
    //   });
    // });
  }

  getLatestSensorsData() {
    return new Promise((resolve, reject) => {
        const cacheKey = "data_latest";
        if (this.cache.get(cacheKey,resolve)) return;
        console.debug("search latest");
        fetch(API_URL+"/state")
        .then(status)
        .then(json)
        .then(mapStateToSensor)
        .then((data)=>{
          resolve(this.cache.put(cacheKey, data, 60000 * 5)); //5 min
        }).catch(reject);
    });
  }

  getHourSensorsData(hourEpoch) {
    return new Promise((resolve, reject) => {
        const cacheKey = "data_hourEpoch_"+hourEpoch;
        if (this.cache.get(cacheKey,resolve)) return;
        console.debug("search hourEpoch:" + hourEpoch);

        fetch(API_URL+"/state/hour/"+hourEpoch)
        .then(status)
        .then(json)
        .then(mapStateToSensor)
        .then((data)=>{
          resolve(this.cache.put(cacheKey, data, 60000 * 5)); //5 min
        }).catch(reject);
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



}

let pmService = new PmService();
export default pmService;