import React, { Component }  from 'react'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'
import { CircularProgress } from 'material-ui/Progress';
import { withStyles } from 'material-ui/styles';
import { withTheme } from 'material-ui/styles';


const styles = theme => ({
    root : {
        width:'30px',
        display:'flex',
        justifyContent:'center',
        flexDirection:'column',
        alignItems:'center'
    },
    sliderWrapper : {
        padding: '15px 0 5px 0'
    },
    slider : {
        height:'150px'
    },
    progress : {
        marginTop:'5px'
    }
});

class TimeSlider extends Component {

    state = {
        slider:false
    }

    onChange(value) {
        console.debug('change',value);
        this.props.onChange(value - this.props.max);
    }

    toggleSlider() {
        this.setState(Object.assign({},this.state,{slider:!this.state.slider}));
    }

    renderSlider() {
        const {theme,classes,max,value,onBeforeChange,onAfterChange} = this.props;
        const sliderStyles = {
            track : {
                backgroundColor:theme.palette.grey['A200']
            },
            handle : {
                borderColor: theme.palette.primary[500],
                background: theme.palette.primary[500]
            }
        }

        if (this.state.slider) {
            return (
            <div className={classes.sliderWrapper}>
            <Slider className={classes.slider}
                    trackStyle={sliderStyles.track}
                    handleStyle={sliderStyles.handle}
                    min={0} max={max} defaultValue={max-value} vertical={true}
                    onBeforeChange={onBeforeChange}
                    onChange={(val)=>{this.onChange(val)}}
                    onAfterChange={()=>{this.toggleSlider();onAfterChange()}}
            />
            </div>)
        }
    }

    render() {
        const {classes,anim,label} = this.props;
        let labelElem = anim === true ? <CircularProgress className={classes.progress} size={20}/> : <span>{label}</span>;
        return (
            <div className={"leaflet-control-layers leaflet-control leaflet-bar "+classes.root}>
                {this.renderSlider()}
                <a onClick={()=>this.toggleSlider()}>
                    {labelElem}
                </a>
            </div>
        );
    }
}

export default withTheme()(withStyles(styles)(TimeSlider))