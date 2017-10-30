import React, { Component }  from 'react'
import SensorMap from './components/SensorMap'
import {MuiThemeProvider,createMuiTheme} from 'material-ui/styles'
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography'
import IconButton from 'material-ui/IconButton'
import './App.css'
import dataService from './shared/DataService'
import storage from './shared/Storage'
import DrawerSensorList from './components/DrawerSensorList'
import List from 'material-ui-icons/List'
import InfoOutline from 'material-ui-icons/InfoOutline'
import ChartDialog from './components/ChartDialog'
import AboutDialog from './components/AboutDialog'
import {SensorLayer} from './shared/Model'


const theme = createMuiTheme({
  palette: {
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
      next : (mapData)=>{
        console.log('mapData',mapData);
        this.setState((state)=>(Object.assign({}, state, {mapData:mapData})));
      }
    });
    dataService.subscribeLoading({
      next : (loading)=>{
        this.setState((state)=>(Object.assign({}, state, {loading:loading})));
      }
    })
  }

  onViewportChanged(viewport) {
    console.log('onViewportChanged',viewport);
    storage.storagePut('map.center', viewport.center);
    storage.storagePut('map.zoom', viewport.zoom);
    
    // well, this does not work, probably due to 'center', zoom is ok, can we split?
    this.setState((prevState)=>(
      Object.assign({},prevState,{zoom:viewport.zoom})
    ));
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
    alert('TODO show info for '+sensor.sensorId);
  }

  onChartClick(sensor) {
    this.setState((prev)=>(Object.assign({},prev,{chartDialog:{sensor:sensor}})))
  }

  toggleMenu(opened) {
    this.setState(Object.assign({},this.state,{drawerOpen:opened}));
  }

  render() {
    return (
      <MuiThemeProvider theme={theme}>
        <div className="cnt">

       
          <ChartDialog
            open={!!this.state.chartDialog}
            chartParams={this.state.chartDialog}
            onRequestClose={()=>this.setState((prev)=>(Object.assign({},prev,{chartDialog:null})))} />

          <AboutDialog
            open={this.state.aboutDialogOpen}
            onRequestClose={()=>this.setState((prev)=>(Object.assign({},prev,{aboutDialogOpen:false})))} />   

          <AppBar position="absolute">
          <Toolbar>
            <div className="appBarIcon"></div>
            <Typography type="title" color="inherit" className="title">
              OpenAirProject
            </Typography>
            <IconButton color="contrast" onClick={()=>this.toggleMenu(!this.state.drawerOpen)}>
                <List />
            </IconButton>
            <IconButton color="contrast" onClick={()=>this.setState((prev)=>(Object.assign({},prev,{aboutDialogOpen:true})))}>
                <InfoOutline />
            </IconButton>
            </Toolbar>
          </AppBar>

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