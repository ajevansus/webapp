import React, { Component }  from 'react'
import SensorMap from './components/SensorMap'
import {MuiThemeProvider,createMuiTheme} from 'material-ui/styles'
//import {lightGreen} from 'material-ui/colors'
import OapAppBar from './components/OapAppBar'
import './App.css'
import dataService from './shared/DataService'
import storage from './shared/Storage'
import DrawerSensorList from './components/DrawerSensorList'
import ChartDialog from './components/ChartDialog'
import AboutDialog from './components/AboutDialog'
import {SensorLayer} from './shared/Model'


const theme = createMuiTheme({
  palette: {
    //primary : lightGreen
  }
});

class App extends Component {

  constructor() {
    super();
    this.state = {
      loading: false,
      drawerOpen:false,
      chartDialog:null,
      mapData : {sensors:[],layers:SensorLayer.OUTDOOR},
      center: storage.storageGet('map.center', [51.077069, 17.038199]), //we have to validate result returned from the storage!
      zoom: storage.storageGet('map.zoom', 13)
    }
  }

  componentDidMount() {
    dataService.subscribeData({
      onNext : (mapData)=>{
        console.log('mapData',mapData);
        this.setState((state)=>(Object.assign({}, state, {mapData:mapData})));
      }
    });
    dataService.subscribeLoading({
      onNext : (loading)=>{
        this.setState((state)=>(Object.assign({}, state, {loading:loading})));
      }
    })
  }

  onViewportChanged(viewport) {
    console.log('onViewportChanged',viewport);
    storage.storagePut('map.center', viewport.center);
    storage.storagePut('map.zoom', viewport.zoom);
    
    // setState here causes map refresh and popup flickering;
    // since it is called by map itself we don't need it, but
    // we need to store zoom
    //
    // this.setState((prevState)=>(
    //   Object.assign({},prevState,{zoom:viewport.zoom})
    // ));
    // eslint-disable-next-line
    this.state.center = viewport.center;
    // eslint-disable-next-line
    this.state.zoom = viewport.zoom;
  }

  onSelectSensor(sensor) {
    //this.onViewportChanged({center:[sensor.location.lat, sensor.location.lng]});
    let center = [sensor.location.lat, sensor.location.lng];
    storage.storagePut('map.center', center);
    this.setState((prevState)=>(
      Object.assign({},prevState,{center:center}))
    );
  }

  onInfoClick(sensor) {
    if (sensor.link) window.open(sensor.link,"_blank");
  }

  onChartClick(sensor) {
    this.setState((prev)=>(Object.assign({},prev,{chartDialog:{sensors:[sensor],params:["pm2_5"]}})))
  }

  toggleMenu(opened) {
    this.setState(Object.assign({},this.state,{drawerOpen:opened}));
  }

  renderChartDialog() {
      return (<ChartDialog
      open={!!this.state.chartDialog}
      chartParams={this.state.chartDialog}
      onRequestClose={()=>this.setState((prev)=>(Object.assign({},prev,{chartDialog:null})))} />)
  }

  render() {
    return (
      <MuiThemeProvider theme={theme}>
        <div className="cnt">

          {this.renderChartDialog()}

          <AboutDialog
            open={this.state.aboutDialogOpen}
            onRequestClose={()=>this.setState((prev)=>(Object.assign({},prev,{aboutDialogOpen:false})))} />   

          <OapAppBar
            onDrawerToggleClick={()=>this.toggleMenu(!this.state.drawerOpen)}
            onInfoClick={()=>this.setState((prev)=>(Object.assign({},prev,{aboutDialogOpen:true})))}/>

          <DrawerSensorList drawerOpen={this.state.drawerOpen}
              title={dataService.getLayerTitle()}
              onSelectSensor={(sensor)=>this.onSelectSensor(sensor)}
              onClose={()=>this.toggleMenu(false)}
              sensors={this.state.mapData.sensors}
              onFavoriteClick={(sensor)=>{dataService.onFavoriteSensor(sensor.sensorId)}} //buffer and apply AFTER drawer is closed?
              onInfoClick={(sensor)=>{this.onInfoClick(sensor)}}
              onChartClick={(sensor)=>{this.onChartClick(sensor)}}
              />

          <SensorMap 
              loading={this.state.loading}
              data={this.state.mapData}
              center={this.state.center}
              zoom={this.state.zoom}
              onViewportChanged={(v)=>this.onViewportChanged(v)}
              onFavoriteClick={(sensor)=>{dataService.onFavoriteSensor(sensor.sensorId)}}
              onSensorLayerChanged={(layer)=>{dataService.onSensorLayerChanged(layer)}}
              onTimeChanged={(time)=>{dataService.onTimeChanged(time)}}
              onInfoClick={(sensor)=>{this.onInfoClick(sensor)}}
              onChartClick={(sensor)=>{this.onChartClick(sensor)}}
              />
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;