import React, { Component }  from 'react'
import './SensorPane.css'
import Card, { CardActions,CardHeader } from 'material-ui/Card';
import Collapse from 'material-ui/transitions/Collapse';
import SensorDetails from './SensorDetails'
import Avatar from 'material-ui/Avatar';
import IconButton from 'material-ui/IconButton';
import Favorite from 'material-ui-icons/Favorite';
import FavoriteBorder from 'material-ui-icons/FavoriteBorder';
// eslint-disable-next-line
import Timeline from 'material-ui-icons/Timeline';
import moment from 'moment'
import { withStyles } from 'material-ui/styles';

import NaturePeople from 'material-ui-icons/NaturePeople'
import Home from 'material-ui-icons/Home'
import BugReport from 'material-ui-icons/BugReport'
import ExpandMoreIcon from 'material-ui-icons/ExpandMore'
import InfoOutline from 'material-ui-icons/InfoOutline';
import classnames from 'classnames';
import storage from '../shared/Storage'

const styles = theme => ({
    card : {
        //border:'1px solid #eee',
        backgroundColor:'rgba(255,255,255,0.9)'
    },
    headerTitle : {fontSize:'1.5em',fontWeight:'normal',padding:'0.25em 0.25em 0 0',display:'flex',alignItems:'center'},
    subheader : {
        display:'flex',
        width:'100%',
        color:'#999',
        fontWeight:'normal',
        alignItems:'center'
    },
    avatarInner: {border:'1px solid #eee'},
    headerRoot :{
        padding:'0.25em 0.5em'
    },
    headerIcon:{
        width:'1em',
        height:'1em',
        marginRight:'0.25em'
    },
    flexGrow:{flex:'1 1 auto'},
    expand: {
        transform: 'rotate(0deg)',
        transition: theme.transitions.create('transform', {
          duration: theme.transitions.duration.shortest,
        }),
      },
      expandOpen: {
        transform: 'rotate(180deg)',
      },
    indicator : {
        borderRadius:'50%',
        width:'1em',
        height:'1em',
        minWidth:'1em',
        border: '4px solid rgba(255,255,255,0.5)',
        boxSizing: 'border-box'
    }  
});

class SensorPane extends Component {
        state = {
            expanded:storage.storageGet('cards.expanded',{})[this.props.sensorTuple.sensor.sensorId]
        }
    

    handleExpandClick = () => {
        const isExpanded = !this.state.expanded;
        
        const s = storage.storageGet('cards.expanded',{});
        s[this.props.sensorTuple.sensor.sensorId] = isExpanded;
        storage.storagePut('cards.expanded', s);

        this.setState({ expanded: isExpanded});
      }

    render() {
        // eslint-disable-next-line
        const {sensorTuple,onFavoriteClick,onInfoClick,onChartClick,onClick,classes,indicator,collapsible} = this.props;
        const subheader = <div className={classes.subheader}>

{sensorTuple.sensor.test ? <BugReport className={classes.headerIcon}/> : ''}
            {sensorTuple.sensor.indoor ? <Home className={classes.headerIcon}/> : <NaturePeople className={classes.headerIcon}/>}
            {moment(((sensorTuple.state||{}).localTime || sensorTuple.sensor.lastSeen)*1000).calendar()}
            <span className={classes.flexGrow}/>
        </div>

        const title = (<div className={classes.headerTitle}>{sensorTuple.sensor.name}
                            <span className={classes.flexGrow}/>
                            {indicator?<div className={classes.indicator+' level-'+(sensorTuple.state && sensorTuple.state.results ? sensorTuple.state.results.aqi : 'undef')}></div>:''}
                            </div>)

        let avatarUrl = sensorTuple.sensor.avatarUrl;
        if (!avatarUrl) {
            avatarUrl = "/assets/default-avatar.png";
        } else if (!avatarUrl.startsWith('http')) {
            avatarUrl = "https://openairproject.com/data/avatars/"+avatarUrl;
        }
        
        return (<Card className="SensorPane" classes={{root:classes.card}} elevation={1} onClick={onClick}>
          <CardHeader
            classes={{root:classes.headerRoot, subheader: classes.subheader}}
            title={title}
            subheader={subheader}
            avatar={<Avatar src={avatarUrl} className={classes.avatarInner}/>}
          >
          </CardHeader>

            <CardActions>
                <IconButton onClick={onFavoriteClick}>
                    {sensorTuple.user.fav ? <Favorite/> : <FavoriteBorder/>}
                </IconButton>
                {/* <IconButton onClick={onChartClick}>
                    <Timeline/>
                </IconButton> */}
                { sensorTuple.sensor.link ? (
                <IconButton onClick={onInfoClick}>
                    <InfoOutline/>
                </IconButton>
                ):''}

                <div className={classes.flexGrow} />
                {collapsible ? (<IconButton
                className={classnames(classes.expand, {
                    [classes.expandOpen]: this.state.expanded,
                })}
                onClick={this.handleExpandClick}
                ><ExpandMoreIcon />
            </IconButton>): ''}
                
                
            </CardActions>  

            <Collapse in={this.state.expanded || !collapsible} transitionDuration="auto" unmountOnExit>
            <SensorDetails sensorState={sensorTuple.state}/>
            </Collapse>

        </Card>)
    }
}

export default withStyles(styles)(SensorPane);