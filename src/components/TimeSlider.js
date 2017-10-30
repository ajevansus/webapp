import React, { Component }  from 'react'
import Slider from 'rc-slider'
import { CircularProgress } from 'material-ui/Progress';
import 'rc-slider/assets/index.css'
import './TimeSlider.css'
import { withStyles } from 'material-ui/styles';


const styles = theme => ({
    slider : {
        padding: '15px 0 5px 0'
    },
    progress : {
        marginTop:'5px'
    }
});

class TimeSlider extends Component {

    state = {
        slider:false
    }
    
    renderSlider() {
        if (this.state.slider) {
            return (<div className={this.props.classes.slider}><Slider min={0} max={this.props.max} defaultValue={this.props.max-this.props.value} vertical={true}
            onBeforeChange={this.props.onBeforeChange}
            onChange={(value)=>{this.onChange(value)}}
            onAfterChange={(value)=>{
                    this.toggleSlider();
                    this.props.onAfterChange()}}
            /></div>)
        }
    }

    onChange(value) {
        console.debug('change',value);
        this.props.onChange(value - this.props.max);
    }

    toggleSlider() {
        this.setState(Object.assign({},this.state,{slider:!this.state.slider}));
    }

    render() {
        const {classes,anim,label} = this.props;
        let labelElem = anim === true ? <CircularProgress className={classes.progress} size={20}/> : <span>{label}</span>;
        return (
            <div className="leaflet-control-layers leaflet-control leaflet-bar TimeSlider">
                {this.renderSlider()}
                <a onClick={()=>this.toggleSlider()}>
                    {labelElem}
                </a>
            </div>
        );
    }
}

export default withStyles(styles)(TimeSlider)