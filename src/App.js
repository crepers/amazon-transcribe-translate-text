// wcjung
import './App.css';
import React, { useState } from 'react';
import Amplify, { Auth } from 'aws-amplify';

import { makeStyles } from '@material-ui/core/styles';
import { AmplifyAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import { AuthState, onAuthUIStateChange } from '@aws-amplify/ui-components';
import PropTypes from 'prop-types';
import { AppBar, Toolbar, Typography, Tabs, Tab, Box, Button } from '@material-ui/core';

import AudioRecorder from './components/audiorecoder';
import RealTimeTranscription from './components/realtimetranscription';
import Translator from './components/translator';

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  list: {
    width: 250,
  },
  fullList: {
    width: 'auto',
  },
}));

const AuthStateApp = () => {
  const classes = useStyles();

  const [authState, setAuthState] = React.useState();
  const [user, setUser] = React.useState();
  const [value, setValue] = React.useState(0);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  React.useEffect(() => {
    onAuthUIStateChange((nextAuthState, authData) => {
        setAuthState(nextAuthState);
        setUser(authData)
    });
  }, []);

  TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
  };
  
  function TabPanel(props) {
    const { children, value, index, ...other } = props;
  
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box p={3}>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    );
  }
  
  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }
  
  const logout = async () => {
    await Auth.signOut();
  };

  /**
   * Return
   */
  return authState === AuthState.SignedIn && user ? (
      <div className="App">
        <AppBar position="static">
          <Toolbar>
         
          <Typography variant="h6" className={classes.title}>
              {user.attributes.email}
            </Typography>
            <Button color="inherit" onClick={logout}>Sign Out</Button>
          </Toolbar>
        </AppBar>
        <AppBar position="static" color='default'>
          <Tabs value={value} onChange={handleChange} aria-label="Amplify Predictions example">
            <Tab label="Amazon Translate" {...a11yProps(0)} />
            <Tab label="Amazon Transcribe" {...a11yProps(1)} />
            {/* <Tab label="Real-time Transcription" {...a11yProps(2)} /> */}
          </Tabs>
        </AppBar>
        <TabPanel value={value} index={0}>
          <Translator/>
        </TabPanel>
        <TabPanel value={value} index={1}>
            <AudioRecorder/>
        </TabPanel>
        {/* <TabPanel value={value} index={2}>
            <RealTimeTranscription/>
        </TabPanel> */}
      </div>
    ) : (
      <AmplifyAuthenticator />
  );
}

export default AuthStateApp;