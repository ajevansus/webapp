import React, { Component }  from 'react'
import NaturePeople from 'material-ui-icons/NaturePeople'
import Home from 'material-ui-icons/Home'
import Favorite from 'material-ui-icons/Favorite'
import BugReport from 'material-ui-icons/BugReport'
import {SensorLayer} from '../shared/Model'
import { withStyles } from 'material-ui/styles';
import { withTheme } from 'material-ui/styles';

const styles = theme => ({
    button : {
        display: 'flex',
        outline: 'none',
        alignItems: 'center',
        justifyContent: 'center',
        cursor:'pointer'
    }
});

class LayerSelector extends Component {

    render() {
        const {active,onClick,theme,classes} = this.props;

        const style = {
            display: 'flex'
        }
        const activeStyle = Object.assign({},style, {color:theme.palette.primary[500]});

        return (
            <div className="leaflet-control-layers leaflet-control leaflet-bar">
                <a style={active & SensorLayer.OUTDOOR ? activeStyle : style} className={classes.button} title="Outdoor sensors" onClick={(e)=>onClick(SensorLayer.OUTDOOR)}><NaturePeople/></a>
                <a style={active & SensorLayer.INDOOR ? activeStyle : style} className={classes.button} title="Indoor sensors" onClick={(e)=>onClick(SensorLayer.INDOOR)}><Home/></a>
                <a style={active & SensorLayer.FAVORITE ? activeStyle : style} className={classes.button} title="Favorite sensors" onClick={(e)=>onClick(SensorLayer.FAVORITE)}><Favorite/></a>
                <a style={active & SensorLayer.TEST ? activeStyle : style} className={classes.button} title="Test sensors" onClick={(e)=>onClick(SensorLayer.TEST)}><BugReport/></a>
            </div>
        );
    }

}

export default withTheme()(withStyles(styles)(LayerSelector))