import Rx from 'rxjs'
import moment from 'moment'
import {SensorLayer} from './Model'
import storage from './Storage'
import oapService from './OapApi'

const AUTO_UPDATE_INTERVAL = 1000 * 60 * 15; //15 minutes

class DataService {


    constructor() {
        this.autoUpdate = null;
        this.dataSubject = new Rx.BehaviorSubject({sensors:[],user:{},state:{}});
        this.loadingSubject = new Rx.BehaviorSubject(false);

        this.query = {
            time : null,   //now
            layer: storage.storageGet('layer', SensorLayer.OUTDOOR)  //outdoor
        }
        this.last = {}
        this.favs=storage.storageGet('favs',[]);   
        
        //fetch & set auto-refresh
        this.onTimeChanged(0);
    }

    getLayerTitle() {
        const s = ' sensors';
        switch (this.query.layer) {
            case SensorLayer.FAVORITE : return 'Favorite'+s
            case SensorLayer.TEST : return 'Test'+s
            case SensorLayer.OUTDOOR : return 'Outdoor'+s
            case SensorLayer.INDOOR : return 'Indoor'+s
            default: return '?';
        }
    }

    subscribeData(consumer) {
        return this.dataSubject.subscribe(consumer);
    }
    subscribeLoading(consumer) {
        return this.loadingSubject.subscribe(consumer);
    }
    shouldDisplay(sensor) {
        switch (this.query.layer) {
            case SensorLayer.FAVORITE : return this.favs.indexOf(sensor.sensorId) !== -1;
            case SensorLayer.TEST : return sensor.test;
            case SensorLayer.OUTDOOR : return !sensor.indoor && !sensor.test;
            case SensorLayer.INDOOR : return sensor.indoor && !sensor.test;
            default: return false;
        }
    }

    fetch() {
        this.requestId = Math.random();
        console.debug("REQUEST ID="+this.requestId);
        const r = this.requestId;
        this.loadingSubject.next(true);
        
        Promise.all([oapService.getSensors(), oapService.getAllSensorsData({time:this.query.time})])
            .then((resp)=>{
                if (r !== this.requestId) {
                    console.debug("REQUEST ID="+r+" cancelled");
                    return; //cancelled
                }
                this.loadingSubject.next(false);
                this.update({sensors:resp[0], states:resp[1]});
            },(e)=>{console.error(e)});
    }

    handleError(e) {
        console.error(e);
        this.loadingSubject.next(false);
    }
    
    update(response) {
        this.last = response || this.last;

        let data = Object.getOwnPropertyNames(this.last.sensors).map((sensorId)=>this.last.sensors[sensorId]).filter((s)=>(this.shouldDisplay(s))).map((s)=>({
            sensor: s, //comes from oap_things table (predefined values that cannot be altered by user)
            state: this.last.states[s.sensorId], //comes from oap_last/oap_hour table
            user: {fav: this.favs.indexOf(s.sensorId) !== -1 }
          }));

        this.dataSubject.next({
            sensors: data,  //rename?
            layers: this.query.layer,
            time: this.query.time || moment().minutes(0),
            timeHourOffset: this.query.time ? this.query.time.diff(moment(), 'hours') : 0
        });
    }

    onTimeChanged(time) {
        console.log('TIME CHANGE',time);
        this.query = Object.assign({}, this.query, {time: time ? moment().add(time, 'hours').minutes(0) : null});
        setTimeout(()=>this.fetch(), 100); //buffer series of events when sliding fast

        if (this.query.time) {
            clearInterval(this.autoUpdate);
        } else {
            this.autoUpdate = setInterval(()=>this.fetch(), AUTO_UPDATE_INTERVAL);
        }
    }

    onFavoriteSensor(sensorId) {
        let sensorIdx = this.favs.indexOf(sensorId);
        if (sensorIdx === -1) {
            this.favs = [...this.favs, sensorId];
        } else {
            this.favs = this.favs.slice();
            this.favs.splice(sensorIdx, 1);
        }
        storage.storagePut('favs', this.favs);
        this.update();
    }

    onSensorLayerChanged(layer) {
        console.log('LAYER CHANGE',layer);
        this.query.layer = layer;
        storage.storagePut('layer', layer);
        this.fetch();
    }

}


let dataService = new DataService();



export default dataService;