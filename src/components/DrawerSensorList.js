import React, { Component }  from 'react'
import Drawer from 'material-ui/Drawer'
import Divider from 'material-ui/Divider'
import IconButton from 'material-ui/IconButton'
import SensorList from './SensorList'
import ChevronLeftIcon from 'material-ui-icons/ChevronLeft'
import Typography from 'material-ui/Typography'
import { withStyles } from 'material-ui/styles';

const styles = theme => ({
    drawerHeader: {
        ...theme.mixins.toolbar,
        background:'#fff',
        display:'flex',
        alignItems:'center',
        paddingLeft:'20px'
    },
    paper : {
        background:"rgba(0,0,0,0.2)"
    },
    flexGrow:{flex:'1 1 auto'}
  });

class DrawerSensorList extends Component {

    render() {
        const {title,classes,drawerOpen,onClose,sensors,onFavoriteClick,onSelectSensor,onInfoClick,onChartClick} = this.props;
        return (
            <Drawer type="persistent" anchor="left" open={drawerOpen} classes={{paper:classes.paper}}>
                <div className={classes.drawerHeader}>
                <Typography type="title" color="inherit" className="title">
              {title}
            </Typography>
                    <div className={classes.flexGrow}/>
                    <IconButton onClick={()=>onClose()}>
                    <ChevronLeftIcon />
                    </IconButton>
                </div>
                <Divider />
                <SensorList sensors={sensors}
                    onFavoriteClick={onFavoriteClick}
                    onSelectSensor={onSelectSensor}
                    onInfoClick={onInfoClick}
                    onChartClick={onChartClick}
                    />
            </Drawer>
        )
    }
}

export default withStyles(styles, { withTheme: true })(DrawerSensorList);