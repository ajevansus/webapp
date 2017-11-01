import React, { Component }  from 'react'
import { Map, TileLayer, Marker, Popup, ZoomControl} from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-markercluster'
import L from 'leaflet'
import LayerSelector from './LayerSelector'
import TimeSlider from './TimeSlider'
import SensorPane from './SensorPane'
import { withStyles } from 'material-ui/styles';


const styles = theme => ({
  time : {
    fontWeight:'bold',
    display:'flex',
    justifyContent:'center'
  },
  hours : {
    marginRight:'2px'
  },
  minutes : {
    fontSize:'0.7em'
  }
});

const is12hourClock = ['en-US','en-UK','en-IE','en-AU'].indexOf(navigator.language) !== -1;

class SensorMap extends Component {

  constructor() {
    super()   

    this.markerclusterOptions = {
      showCoverageOnHover: false,
      spiderfyDistanceMultiplier: 2,
  
      // https://github.com/Leaflet/Leaflet.markercluster#customising-the-clustered-markers
      iconCreateFunction: (cluster) => {
        let aqi = 0;
        let count = 0;
        cluster.getAllChildMarkers().forEach((m)=>{
          let sensorTuple = this.props.data.sensors.find((s)=>(s.sensor.sensorId===m.options.sensorId)); //do not use 'const sensors'!
          if (sensorTuple && sensorTuple.state && sensorTuple.state.results) { aqi+=sensorTuple.state.results.aqi; count++; }
        })
        return L.divIcon({
          html: `<span>${cluster.getChildCount()}</span>`,
          className: 'sensor-marker-cluster level-'+(count ? Math.floor(aqi/count) : 'undef'),
          iconSize: L.point(40, 40, true)
        })
      }
    }
  }


  onFavoriteClick(sensor) {
    console.log(sensor);
  }
  
  renderTime(time) {
    const {classes} = this.props;
    if (is12hourClock) {
      return <div className={classes.time}><div className={classes.hours}>{time.format('hh')}</div><div className={classes.minutes}>{time.format('A')}</div></div>
    } else {
      return <div className={classes.time}><div className={classes.hours}>{time.format('HH')}</div><div className={classes.minutes}>:{time.format('mm')}</div></div>
    }
  }

  render() {
    
    const {center,zoom,loading,onViewportChanged,data,onFavoriteClick,onSensorLayerChanged,onTimeChanged,onInfoClick,onChartClick,classes} = this.props;    

    
    const aqicn = 'https://tiles.waqi.info/tiles/usepa-aqi/{z}/{x}/{y}.png?token=64d56f3f45c2abc8e08ce8012f05d9aecb0a3c54';
    const carto = 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png';

    
    return (

      <Map ref={(map)=>this.map=map} center={center} zoom={zoom} zoomControl={false} onViewportChanged={onViewportChanged}>
        <ZoomControl position='bottomright'/>
        <TileLayer
          attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>'
          url={carto}
        />
        
        {
          //http://aqicn.org/faq/2015-09-18/map-web-service-real-time-air-quality-tile-api/
          //<TileLayer url={aqicn}/>
        }

        <MarkerClusterGroup options={this.markerclusterOptions} wrapperOptions={{enableDefaultStyle: true}}
          ref={(m) => {
              if (m) {
                m.leafletElement.refreshClusters();
              }
            }
          }>
            {data.sensors.map((s)=>{
                let markerIcon = L.divIcon({
                  className: 'sensor-marker level-'+(s.state && s.state.results ? s.state.results.aqi : 'undef'),
                  iconAnchor: L.point(11,11),
                  popupAnchor: L.point(0,-11)
                });
                return (<Marker position={[s.sensor.location.lat, s.sensor.location.lng]} icon={markerIcon} key={s.sensor.sensorId} sensorId={s.sensor.sensorId}>
                    <Popup autoClose={false}>
                      <SensorPane sensorTuple={s} indicator={false} collapsible={false}
                        onFavoriteClick={()=>onFavoriteClick(s.sensor)}
                        onInfoClick={()=>onInfoClick(s.sensor)}
                        onChartClick={()=>onChartClick(s.sensor)}
                      />
                    </Popup>
                  </Marker>)
            })}
        </MarkerClusterGroup>
         
        <div className="leaflet-bottom leaflet-right" style={{bottom:"90px"}}>
            <TimeSlider 
                anim={loading}
                label={data.time ? (data.timeHourOffset===0 ? <div className={classes.time}>Now</div> : this.renderTime(data.time)) : '?'}
                max={24}
                value={-data.timeHourOffset}  //from 0 (now) to (24) hours ago
                onBeforeChange={()=>this.map.leafletElement.dragging.disable()}
                onChange={(time)=>onTimeChanged(time)}
                onAfterChange={()=>{this.map.leafletElement.dragging.enable()}}/>
            <LayerSelector active={data.layers} onClick={onSensorLayerChanged}/>
        </div>
      </Map>
    );
  }
}

export default withStyles(styles)(SensorMap);