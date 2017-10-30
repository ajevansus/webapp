class MockApi {
    constructor(sensorCount) {
        this.sensors = [];

        [SensorLayer.OUTDOOR, SensorLayer.INDOOR, SensorLayer.TEST].forEach(layer=>{

            let prefix;
            switch (layer) {
                case SensorLayer.OUTDOOR : prefix = 'outdoor'; break;
                case SensorLayer.INDOOR : prefix = 'indoor'; break;
                case SensorLayer.TEST : prefix = 'test'; break;
                default : prefix = '?'; break;
            }

            for (var i = 1; i <= sensorCount; i++) {
                let sensor = {
                    avatarUrl : '/images/avatar2017.jpg',
                    config: {
                        indoor : layer === SensorLayer.INDOOR,
                        test : layer === SensorLayer.TEST
                    },
                    sensorId:prefix+'_'+i,
                    name:prefix+'_'+i+'!',
                    enabled:true,
                    link:'https://openairproject.com/#',
                    location:{lat:51.077069 + (Math.random()-0.5)/2, lng: 17.038199 + (Math.random()-0.5)/2},
                };
                this.sensors.push(sensor);
            }
        });
    }

    generateThingState(sensor) {
        let aqi = Math.random()*10;
        return {
            sensorId : sensor.sensorId,
            localTime : moment().valueOf(),
            serverTime : moment().valueOf(),
            results : {
                aqi: Math.floor(aqi),
                pm:{
                    pm1_0:Math.floor(aqi * 11),
                    pm2_5:Math.floor(aqi * 10),
                    pm10:Math.floor(aqi * 9),
                    sensor:0
                },
                weather : {
                    temp        : 20.1,
                    pressure    : 1002,
                    humidity    : 67,
                    sensor      : 0
                }
            }
        }
    }

    generateThingStates() {
        var states = {};
        this.sensors.forEach(s=>{
           states[s.sensorId] = this.generateThingState(s); 
        });
        return states;
    }
}