import React, { Component }  from 'react'

import './PercentageLabel.css'
import {calculateLevel} from '../shared/Utils'

class PercentageLabel extends Component {

    render() {
        const p = calculateLevel(this.props.value, this.props.hundred, this.props.step);
        return (<span className={'PercentageLabel level-'+p.level}>{p.percentage}%</span>);
    }

}

export default PercentageLabel;