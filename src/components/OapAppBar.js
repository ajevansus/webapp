import React, { Component }  from 'react'
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography'
import IconButton from 'material-ui/IconButton'
import List from 'material-ui-icons/List'
import InfoOutline from 'material-ui-icons/InfoOutline'
import { withStyles } from 'material-ui/styles';

const styles = {
    appBarIcon : {
        width: "30px",
        height: "30px",
        backgroundImage: "url('/assets/logo256-grey.png')",
        backgroundSize: "cover",
        marginRight: "0.5em"
      },
    title : {
        flexGrow:2,
        fontWeight: 400
    }
  };

class OapAppBar extends Component {

    render() {
        const {onDrawerToggleClick, onInfoClick,classes} = this.props;
        return (
        <AppBar position="absolute">
        <Toolbar>
          <div className={classes.appBarIcon}></div>
          <Typography type="title" color="inherit" className={classes.title}>
            OpenAirProject
          </Typography>
          <IconButton color="contrast" onClick={onDrawerToggleClick}>
              <List />
          </IconButton>
          <IconButton color="contrast" onClick={onInfoClick}>
              <InfoOutline />
          </IconButton>
          </Toolbar>
        </AppBar>
        )
    }

}


export default withStyles(styles)(OapAppBar);