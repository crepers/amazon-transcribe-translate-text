import React, { useState } from 'react';
import { Predictions } from 'aws-amplify';

import CssBaseline from '@material-ui/core/CssBaseline';
import { makeStyles } from '@material-ui/core/styles';
import { Grid, Button, TextareaAutosize, FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';

import supportLanguage from '../config/translateLanguage';


const useStyles = makeStyles((theme) => ({
    root: {
      display: 'flex',
      '& > *': {
        margin: theme.spacing(1),
        width: theme.spacing(16),
        height: theme.spacing(16),
      },
    },
    textarea: {
      width: '100%',
    },
    paper: {
      textAlign: 'center',
      height: '100%',
      color: theme.palette.text.secondary,
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    buttonPadding: {    
      margin: '10px',   
    },
}));

function Translator() {
    const classes = useStyles();

    const [response, setResponse] = useState();
    const [text, setText] = useState();
    const [sourceLanguage, setSourceLanguage] = useState('en');
    const [targetLanguage, setTargetLanguage] = useState('ko');

    async function translate() {
        const responseText = await Predictions.convert({
            translateText: {
            source: {
                text: text,
                language : sourceLanguage // defaults configured on aws-exports.js
                // supported languages https://docs.aws.amazon.com/translate/latest/dg/how-it-works.html#how-it-works-language-codes
            },
            targetLanguage: targetLanguage
            }
        })
        .catch(err => console.log({ err }));
        
        if(responseText) {
            setResponse(responseText.text);
        }
    }

    function clear() {
        setResponse('');
        setText('');
    }
    
    return (
        <div>
            <CssBaseline />
            <Grid container spacing={2} justify="center">
                <Grid item xs={6}>
                        <InputLabel htmlFor="source-language">Source</InputLabel>
                    <FormControl className={classes.formControl}>
                        <Select
                            id='demo-sourceLanguage'
                            value={sourceLanguage}
                            onChange={e => setSourceLanguage(e.target.value)}
                            inputProps={{
                                name: 'sourceLanguage'
                            }}
                        >
                        {supportLanguage.map((value)=> (
                            <MenuItem value={value.code}>{value.name}</MenuItem>
                        ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={6}>
                        <InputLabel htmlFor="target-language">Target</InputLabel>
                    <FormControl className={classes.formControl}>
                        <Select
                            id='demo-targetLanguage'
                            value={targetLanguage}
                            onChange={e => setTargetLanguage(e.target.value)}
                            inputProps={{
                                name: 'targetLanguage'
                            }}
                        >
                        {supportLanguage.map((value)=> (
                            <MenuItem value={value.code}>{value.name}</MenuItem>
                        ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={6}>
                    <TextareaAutosize aria-label="minimum height" rowsMin={3} 
                        onChange={e => setText(e.target.value)}  
                        rows="10" value={text} className={classes.textarea}/>
                </Grid>                        
                <Grid item xs={6}>
                    <TextareaAutosize aria-label="minimum height" rowsMin={3} 
                        rows="10" value={response} className={classes.textarea}
                        inputprops={{
                            readOnly: true,
                        }}/>
                </Grid>
                <Grid item xs={12}>
                    <Button className={classes.buttonPadding} onClick={translate} variant="contained" color="primary">Translate</Button>
                    <Button className={classes.buttonPadding} onClick={clear} variant="contained" color="default">Clear</Button>
                </Grid>
            </Grid>
        </div>
    );
}

export default Translator;