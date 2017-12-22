import React, { Component }  from 'react'
import Dialog from 'material-ui/Dialog';
import CloseIcon from 'material-ui-icons/Close';
import Slide from 'material-ui/transitions/Slide';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography'
import IconButton from 'material-ui/IconButton'
import moment from 'moment'
import { CircularProgress } from 'material-ui/Progress';
import { withStyles } from 'material-ui/styles';
//import { withTheme } from 'material-ui/styles';
import pmService from '../shared/OapApi';

import createPlotlyComponent from 'react-plotlyjs';
//See the list of possible plotly bundles at https://github.com/plotly/plotly.js/blob/master/dist/README.md#partial-bundles or roll your own
//import Plotly from 'plotly.js/dist/plotly-basic';

const styles = theme => ({
  appBar : {
    position:'relative'
  },
  title : {
    flexGrow:2,
    fontWeight: 400
  },
  innerView: {
    flexGrow: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  plotly : {
    width:'100%'
  }
});

class ChartDialog extends Component {

  state = {chart:null};

  async onEntered() {
    //console.log('onEntered');
    let Plotly;
    try {
      Plotly = await import ('plotly.js/dist/plotly-basic');
    } catch (e) {
      console.error(e);
      //TODO error
      return;
    }
    this.renderChart(Plotly);
  }

  onExited() {
    //console.log('onExited');
    this.setState({chart:null});
  }

  onResize = () => {
    //console.log('resize '+window.innerWidth, this);
  }

  componentWillMount() {
    window.addEventListener('resize',this.onResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize',this.onResize);
  }

  getChartData2() {
    return pmService.getSensorData({
        sensorId:this.props.chartParams.sensors[0].sensorId,
        timeFrom:new Date().getTime()/1000 - 3600 * 24 * 3 //3 days
    }).then((data)=>{
        console.log("result:",data);
        let rangeMin,rangeMax,sampleTime,x,y;

        const timeFormat = 'YYYY-MM-DD HH:mm';
        const series = [{
            data : {
                type: "scatter",
                mode: "lines",
                name: 'pm 2.5',
                x: [],
                y: [],
                line: {color: '#ff484a', width: 2, shape:'spline'}
            },
            fn : result=>((result.pm || {}).pm2_5)
        },
            {
                data : {
                    type: "scatter",
                    mode: "lines",
                    name: 'pm 10',
                    x: [],
                    y: [],
                    line: {color: '#ff9d31', width: 2, shape:'spline'}

                },
                fn : result=>((result.pm || {}).pm10)
            },
            {
                data : {
                    type: "scatter",
                    mode: "lines",
                    name: 'temp',
                    yaxis: 'y2',
                    x: [],
                    y: [],
                    line: {color: '#7584f3', width: 1, shape:'spline'}
                },
                fn : result=>((result.weather || {}).temp)
            },
            {
                data : {
                    type: "scatter",
                    mode: "lines",
                    name: 'humidity',
                    yaxis: 'y2',
                    x: [],
                    y: [],
                    line: {color: '#3b61b6', width: 1, shape:'spline'}
                },
                fn : result=>((result.weather || {}).humidity)
            }];


        (data.records||[]).forEach(record=>{
          sampleTime = record.localTime*1000; //sec->msec
          if (!rangeMin || sampleTime < rangeMin) rangeMin = sampleTime;
          if (!rangeMax || sampleTime > rangeMax) rangeMax = sampleTime;
          x = moment(sampleTime).format(timeFormat);
          series.forEach(s=>{
            y = s.fn(record.results || {});
            if (y !== undefined) {
              s.data.y.push(y);
              s.data.x.push(x);
            }
          });
        });

        let result = {
            data : series.filter(s=>(s.data.x.length)).map(s=>(s.data)),
            range : [moment(rangeMin).format(timeFormat), moment(rangeMax).format(timeFormat)]
        };
        return result;
    });
  }

  renderChart(Plotly) {
    if (!this.props.chartParams) return;
    const PlotlyComponent = createPlotlyComponent(Plotly);
    
   
    this.getChartData2(this.props.chartParams).then((d)=>{

      const font = {
          family: "Roboto, Helvetica, Arial",
          size: 10,
          color: '#999999'
      };

      var layout = {
        title: null,
        xaxis: {
          autorange: true,
          rangeslider: {range: d.range, bgcolor:'#ececec'},
          type: 'date',
          tickformat:'%a %H:%M', //TODO 24h vs 12h
          tickfont:font,
          // tickangle: 45,
          showline: true
        },
        yaxis: {
          autorange: true,
          type: 'linear',
          side: 'left',
          tickfont:font,
          showline: true
        },
        yaxis2: {
          autorange: true,
          type: 'linear',
          side: 'right',
          overlaying:'y',
          tickfont:font,
          showline: false,
          showticklabels:false,
          zeroline:false,
          showgrid:false,
          ticks:''
        },
        autosize: true,
        legend: {"orientation": "h",font:font,x:0,y:100},
          //paper_bgcolor: '#ececec',
          //plot_bgcolor: '#b7b7b7',
        margin:{pad:0,l:20,r:20,t:60,b:0}
      };
  
      let config = {
        showLink: false,
        displayModeBar: true,
        legend: {"orientation": "h"}
      };
  
      this.setState({chart: 
        <PlotlyComponent className={this.props.classes.plotly} data={d.data} layout={layout} config={config}/>
      });
    });
    

  }

    renderContent() {
        const {onRequestClose,chartParams,classes} = this.props;
        if (!chartParams) return;

        return ([
        <AppBar className={classes.appBar} key="1"> 
        <Toolbar>
          <Typography type="title" color="inherit" className={classes.title}>
            {chartParams.sensors[0].name}
          </Typography>
          <IconButton color="contrast" onClick={onRequestClose} aria-label="Close">
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>,
          <div className={classes.innerView} key="2">
          {
            this.state.chart || <CircularProgress className={this.props.classes.progress} size={50}/>
          }
          </div>
         ] )
    }

    render() {
        const {open, onRequestClose} = this.props;
        return (
            <Dialog
            onEntered={()=>this.onEntered()}
            onExited={()=>this.onExited()}
            fullScreen
            open={open}
            onRequestClose={onRequestClose}
            transition={<Slide direction="up" />}
          >
            {this.renderContent()}

          </Dialog>
        );
    }

}

export default withStyles(styles)(ChartDialog);