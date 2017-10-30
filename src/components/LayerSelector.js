import React, { Component }  from 'react'
import NaturePeople from 'material-ui-icons/NaturePeople'
import Home from 'material-ui-icons/Home'
import Favorite from 'material-ui-icons/Favorite'
import BugReport from 'material-ui-icons/BugReport'
import './LayerSelector.css'
import {SensorLayer} from '../shared/Model'

export default class LayerSelector extends Component {

    render() {
        const {active,onClick} = this.props;
        return (
            <div className="leaflet-control-layers leaflet-control leaflet-bar LayerSelector">
                <a className={active & SensorLayer.OUTDOOR ? 'active' : ''} title="Outdoor sensors" onClick={(e)=>onClick(SensorLayer.OUTDOOR)}><NaturePeople/></a>
                <a className={active & SensorLayer.INDOOR ? 'active' : ''} title="Indoor sensors" onClick={(e)=>onClick(SensorLayer.INDOOR)}><Home/></a>
                <a className={active & SensorLayer.FAVORITE ? 'active' : ''} title="Favorite sensors" onClick={(e)=>onClick(SensorLayer.FAVORITE)}><Favorite/></a>
                <a className={active & SensorLayer.TEST ? 'active' : ''} title="Test sensors" onClick={(e)=>onClick(SensorLayer.TEST)}><BugReport/></a>
            </div>
        );
    }

}