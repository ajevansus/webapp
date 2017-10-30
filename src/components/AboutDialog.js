import React, { Component }  from 'react'
import Dialog,{DialogTitle} from 'material-ui/Dialog';
import Slide from 'material-ui/transitions/Slide';
import Typography from 'material-ui/Typography'
import { withStyles } from 'material-ui/styles';


const styles = {
  content : {
    padding:'1em'
  }
};

class AboutDialog extends Component {
  
    render() {
        const {open, onRequestClose,classes} = this.props;
        return (
            <Dialog
            
            open={open}
            onRequestClose={onRequestClose}
            transition={<Slide direction="up" />}
          >
             <DialogTitle>About</DialogTitle>
        
          <div className={classes.content}>
          <Typography paragraph="true">
              Our goal is to build a network of cheap but accurate air quality meters.
          </Typography>
          <Typography paragraph="true">
              Based on an open specification you can build your own meter 
              (we currently estimate cost of a single sensor to be around 30 USD)
              and connect it to our platform (or any other IoT service) for free.
          </Typography>
          <Typography paragraph="true">
              This project has a BETA status.
          </Typography>
          <Typography paragraph="true">
              For details please check our <a href="https://github.com/openairproject/sensor-esp32" target="_blank" rel="noopener noreferrer">GitHub</a>
          </Typography>
          </div>
          </Dialog>
        );
    }

}

export default withStyles(styles)(AboutDialog);