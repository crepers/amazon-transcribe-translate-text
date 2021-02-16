import React, { useState } from 'react';
import mic from 'microphone-stream';
import { Predictions } from 'aws-amplify';

import supportLanguage from '../config/transcribeLanguage';
import CssBaseline from '@material-ui/core/CssBaseline';
import { Grid, Button, FormControl, InputLabel, Select, MenuItem, Paper } from '@material-ui/core';

function SpeechToText(props) {
    const [response, setResponse] = useState("'Start Recording'을 눌러 녹음을 시작합니다. 말하기가 끝나면 'Stop Recoding'를 누릅니다.")
    const [sourceLanguage, setSourceLanguage] = useState('ko-KR');

    function AudioRecorder(props) {
      const [recording, setRecording] = useState(false);
      const [micStream, setMicStream] = useState();
      const [audioBuffer] = useState(
        (function() {
          let buffer = [];
          function add(raw) {
            buffer = buffer.concat(...raw);
            return buffer;
          }
          function newBuffer() {
            console.log("resetting buffer");
            buffer = [];
          }
  
          return {
            reset: function() {
              newBuffer();
            },
            addData: function(raw) {
              return add(raw);
            },
            getData: function() {
              return buffer;
            }
          };
        })()
      );
  
      async function startRecording() {
        console.log('start recording');
        audioBuffer.reset();
  
        window.navigator.mediaDevices.getUserMedia({ video: false, audio: true }).then((stream) => {
          const startMic = new mic();
  
          startMic.setStream(stream);
          startMic.on('data', (chunk) => {
            var raw = mic.toRaw(chunk);
            if (raw == null) {
              return;
            }
            audioBuffer.addData(raw);
  
          });
  
          setRecording(true);
          setMicStream(startMic);
        });
      }
  
      async function stopRecording() {
        console.log('stop recording');
        const { finishRecording } = props;
  
        micStream.stop();
        setMicStream(null);
        setRecording(false);
  
        const resultBuffer = audioBuffer.getData();
  
        if (typeof finishRecording === "function") {
          finishRecording(resultBuffer);
        }
  
      }
  
      return (
        <div className="audioRecorder">
          <div>
            {recording && 
                <Button onClick={stopRecording} variant="contained" color="primary">Stop recording</Button>
            }
            {!recording && 
                <Button onClick={startRecording} variant="contained" color="secondary">Start recording</Button>
            }
          </div>
        </div>
      );
    }
  
    function convertFromBuffer(bytes) {
      setResponse('Converting text...');
  
      Predictions.convert({
        transcription: {
          source: {
            bytes
          },
          language: sourceLanguage
        },
      }).then(({ transcription: { fullText } }) => setResponse(fullText))
        .catch(err => setResponse(JSON.stringify(err, null, 2)))
    }
    
    function handleLanguageChange(event) {
        setSourceLanguage(event.target.value);
    }

    return (
      <div>
        <CssBaseline />
        <Grid container spacing={2} justify="center">
            <Grid item xs={12}>
                <InputLabel htmlFor="source-language">Speech to text</InputLabel>
                <FormControl>
                    <Select
                        id='demo-sourceLanguage'
                        value={sourceLanguage}
                        onChange={handleLanguageChange}
                    >
                    {supportLanguage.map((value)=> (
                        <MenuItem value={value.code}>{value.name}</MenuItem>
                    ))}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={12}>
                <AudioRecorder finishRecording={convertFromBuffer} />
            </Grid>
            <Grid item xs={1}></Grid>
            <Grid item xs={10}>
                <Paper variant="outlined" square>
                    {response}
                </Paper>
            </Grid>
            <Grid item xs={1}></Grid>
        </Grid>
      </div>
    );
  }

  export default SpeechToText;