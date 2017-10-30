import React, { Component }  from 'react'
import Dialog from 'material-ui/Dialog';
import CloseIcon from 'material-ui-icons/Close';
import Slide from 'material-ui/transitions/Slide';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography'
import IconButton from 'material-ui/IconButton'

export default class ChartDialog extends Component {

    renderContent() {
        const {onRequestClose,chartParams} = this.props;
        if (!chartParams || !chartParams.sensor) return;

        return (
            <div>
        <AppBar>
        <Toolbar>
          <Typography type="title" color="inherit" className="title">
            {chartParams.sensor.name}
          </Typography>
          <IconButton color="contrast" onClick={onRequestClose} aria-label="Close">
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      TODO
        </div>
        )
    }

    render() {
        const {open, onRequestClose} = this.props;
        return (
            <Dialog
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