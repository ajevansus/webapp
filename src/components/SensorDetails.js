import React, { Component }  from 'react'
import PercentageLabel from './PercentageLabel'
import {isNullOrUndefined} from '../shared/Utils'
import './SensorDetails.css'

class SensorDetails extends Component {

    render() {
        const {sensorState} = this.props;
        const results = (sensorState || {}).results; 
        if (results) {
            let env = results.weather || {};
            let pm = results.pm || {};

            const unitPm = (<span className="unit">&micro;g/m<sup>3</sup></span>);

            return (
                <div className="results">
                    { !isNullOrUndefined(pm.pm1_0) ? <div className="row"><label className="cell">pm 1</label><div className="value cell">{pm.pm1_0}{unitPm}</div></div> : ''}
                    { !isNullOrUndefined(pm.pm2_5) ? <div className="row"><label className="cell">pm 2.5</label><div className="value cell">{pm.pm2_5}{unitPm}</div><PercentageLabel value={pm.pm2_5} hundred={25} step={20}/></div> : ''}
                    { !isNullOrUndefined(pm.pm10) ? <div className="row"><label className="cell">pm 10</label><div className="value cell">{pm.pm10}{unitPm}</div><PercentageLabel value={pm.pm10} hundred={50} step={20}/></div> : ''}
                    { !isNullOrUndefined(env.temp) ? <div className="row"><label className="cell">temperature</label><div className="value cell">{env.temp.toFixed(1)}<span className="unit">&deg;C</span></div></div> : '' }
                    { !isNullOrUndefined(env.humidity) ? <div className="row"><label className="cell">humidity</label><div className="value cell">{env.humidity.toFixed(1)}<span className="unit">%</span></div></div> : '' }
                    { !isNullOrUndefined(env.pressure) ? <div className="row"><label className="cell">pressure</label><div className="value cell">{env.pressure.toFixed(1)}<span className="unit">hPA</span></div></div> : '' }
                </div>
            )
        } else {
            return null;
        }
    }

}

export default SensorDetails;