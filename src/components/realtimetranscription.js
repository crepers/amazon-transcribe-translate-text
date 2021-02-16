import React from 'react';
import { Predictions } from 'aws-amplify';
import * as audioUtils from '../utils/audioUtils';  // for encoding audio data as PCM
import * as marshaller from '@aws-sdk/eventstream-marshaller'; // for converting binary event stream messages to and from JSON
import  * as util_utf8_node from '@aws-sdk/util-utf8-node'; // utilities for encoding and decoding UTF8
import mic from 'microphone-stream'; // collect microphone input as a stream of raw bytes

// our converter between binary event streams messages and JSON
const eventStreamMarshaller = new marshaller.EventStreamMarshaller(util_utf8_node.toUtf8, util_utf8_node.fromUtf8);

// our global variables for managing state
let languageCode;
let region;
let sampleRate = 44100;
let inputSampleRate = 44100;
let micStream;

class microphonestream extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      record: false,
      disabled: false,
      errorMessage: ''
    }
    console.log('constructor');
  }
  
  startRecording = () => {
    this.setState({
      record: true,
      disabled: true
    });
     // first we get the microphone input from the browser (as a promise)...
     window.navigator.mediaDevices.getUserMedia({
      video: false,
      audio: true
    })
    // ...then we convert the mic stream to binary event stream messages when the promise resolves 
    .then(streamAudioToTranscription) 
    .catch(function (error) {
        console.log('There was an error streaming your audio to Amazon Transcribe. Please try again.');
    });
  }
 
  stopRecording = () => {
    this.setState({
      record: false,
      disabled: false
    });
    if(micStream) micStream.stop();
  }

  render() {
    return (
      <div>
        <div>
          {this.state.errorMessage}
        </div>
        <div>
          <button disabled={this.state.disabled} onClick={this.startRecording} type="button">Start</button>
          <button disabled={!this.state.disabled} onClick={this.stopRecording} type="button">Stop</button>
          <button id="reset-button" className="button-xl button-secondary" title="Clear Transcript"> 
            Clear Transcript
          </button>
        </div><div>      
          <textarea id="transcript" placeholder="Press Start and speak into your mic" rows="5"
                readOnly="readonly"></textarea>
        </div>
      </div>
    );
  }
}

// get Buffers (Essentially a Uint8Array DataView of the same Float32 values)
let streamAudioToTranscription = function (userMediaStream) {
  //let's get the mic input from the browser, via the microphone-stream module
  micStream = new mic({bufferSize:16384});

  micStream.setStream(userMediaStream);
  
  // Optionally convert the Buffer back into a Float32Array
  // (This actually just creates a new DataView - the underlying audio data is not copied or modified.) 
  micStream.on('data', function(rawAudioChunk) {
    // let raw = convertAudioToBinaryMessage(rawAudioChunk);
    let raw = mic.toRaw(rawAudioChunk);

    if (raw && raw.length > 0) {
      Predictions.convert({
        transcription: {
          source: {
            bytes : raw
          },
          // language: "en-US", // other options are "en-GB", "fr-FR", "fr-CA", "es-US"
        }
      })
      .then(({ transcription: { fullText } }) => console.log({ fullText }))
      // .catch(err => console.log({ err }));
    }
  });
}


function convertAudioToBinaryMessage(audioChunk) {
  let raw = mic.toRaw(audioChunk);

  if (raw == null)
      return;

  // downsample and convert the raw audio bytes to PCM
  let downsampledBuffer = audioUtils.downsampleBuffer(raw, inputSampleRate, sampleRate);
  let pcmEncodedBuffer = audioUtils.pcmEncode(downsampledBuffer);

  // add the right JSON headers and structure to the message
  let audioEventMessage = Buffer.from(pcmEncodedBuffer);

  //convert the JSON object + headers into a binary event stream message
  // let binary = eventStreamMarshaller.marshall({bytes : audioEventMessage});

  return audioEventMessage;
}

// check to see if the browser allows mic access
if (!window.navigator.mediaDevices.getUserMedia) {
    console.log('check media devices');
    // Use our helper method to show an error on the page
    this.state.errorMessage = 'We support the latest versions of Chrome, Firefox, Safari, and Edge. Update your browser and try your request again.';
    this.state.disabled = true;
    // maintain enabled/distabled state for the start and stop buttons
} else {
    console.log('check media device');
}


export default microphonestream;