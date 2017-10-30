import React, { Component }  from 'react'
import SensorPane from './SensorPane'
import { withStyles } from 'material-ui/styles';
import List, {ListItem} from 'material-ui/List';

  const styles = theme => ({
    root: {
      width: 300,
      //background: theme.palette.background.paper,
      position: 'relative',
      overflow: 'auto',
      padding: '0.5em 0 0 0'
    },
    item: {
      padding:'0 0.5em 0.5em 0.5em'
    },
  });

class SensorList extends Component {


    render() {

        const {sensors,classes,onSelectSensor,onFavoriteClick,onInfoClick,onChartClick} = this.props;

        const items = sensors.map((s)=>(
            <ListItem className={classes.item} key={s.sensor.sensorId}>
            <SensorPane sensorTuple={s} collapsible={true} indicator={true}
                onClick={()=>{onSelectSensor(s.sensor)}}
                onFavoriteClick={()=>onFavoriteClick(s.sensor)}
                onInfoClick={()=>onInfoClick(s.sensor)}
                onChartClick={()=>onChartClick(s.sensor)}
                />
            </ListItem>
        ))

        return (
            <List className={classes.root}>
            {items}
            </List>
        );
    }

}

export default withStyles(styles)(SensorList);