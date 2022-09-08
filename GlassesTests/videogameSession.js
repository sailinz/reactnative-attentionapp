/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

//whenever there is a light notice, survey/guess time- submit or submit and end session end worksession? longer survey with free text,  save file and send.
// on end, survey with free text
//on start, start log, log 'working_session'
//
// startLogging('WORKING'), stopLogging(), sendToStorage()-- after sendToStorage, log 'continue' or something 
// dataLog(), log()

import {decode as atob, encode as btoa} from 'base-64'

import React from "react";
import styles from "../Styles";

import StatusView from "../StatusView.js";
import { useFocusEffect, useIsFocused } from '@react-navigation/native';

import Modal from "react-native-modal";

import StartVideogameSurvey from "../Surveys/StartVideogameSurvey";
import EndGame1Survey from "../Surveys/EndGame1Survey";
import EndGame2Survey from "../Surveys/EndGame2Survey";
import MidGameSurvey from "../Surveys/MidGameSurvey";

import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Button,
  TouchableOpacity,
  TextInput,
  Image,
} from "react-native";



const videogameSessionState = ['off', 'game1A', 'game1B', 'game2A', 'game2B', 'complete'];


export default class VideogameSession extends React.Component {
  constructor(props) {
    super(props);
    this.state = {intensity: 170, startBlue: 70, bIntensity: 50, notes: '',
                  mainInterval: 20, stepInterval: 300, testRunning: false, 
	    	  currentState:0,
	          popover: true, uploading: false};
    this.timer = null;

                    // 0, 0, 0, 0,lB,lG, 0, 0,lR, 0, 0, 0, 0,rB,rG, 0, 0,rR]
    this.lightState = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    this.rg_toggle = true;
    this.transitioning= false;
    this.disconnected = false;	  
  }

  componentDidUpdate = (nextProps) => {
    //on change of glassesStatus or watchStatus...	  
    if (nextProps.glassesStatus !== this.props.glassesStatus || nextProps.watchStatus !== this.props.watchStatus) {
	console.log('Got status update');
	console.log(nextProps.glassesStatus);    
	console.log(this.props.glassesStatus);    
	console.log(this.disconnected);    
        //if glasses are disconnected and we're running a test, pause	    
	if (this.state.testRunning && this.props.glassesStatus != 'Connected.'){
		console.log('vidsession: running and glass  disconnect; pause');
		this.pauseTest();
		this.disconnected = true;
	}

        //if glasses are connected and we've had a disconnect event, resume		    
	if (!this.state.testRunning && this.disconnected && this.props.glassesStatus == 'Connected.'){
		console.log('vidsession: prev disconnect paused us and glasses reconnected; unpause');
		this.resumeTest();
		this.disconnected = false;
	}

	//if we're not scanning and haven't connected to both glasses/watch, scan	  
	if(!this.props.scanning && (this.props.glassesStatus != 'Connected.' || this.props.watchStatus != 'Connected.')){
		console.log('vidsession: we are not scanning but we should be now');
		this.props.setScanning(true);
	}

	//if we're scanning but have connected to both glasses/watch, stop scan	  
	if(this.props.scanning && (this.props.glassesStatus == 'Connected.' && this.props.watchStatus == 'Connected.')){
		console.log('vidsession: we are scanning but we now don\'t need to');
		this.props.setScanning(false);
	}
    }
  }	

  async componentWillUnmount(){
    console.log('unmount vidsession');	  
    if (this.state.testRunning){
      clearTimeout(this.timer);
      await this.props.dataLog('u', ['VIDGAME', 'STOP_TEST']);
      try {	  
	      this.setLightOff();
      }catch(e){
	console.log('pause came from disconnect; cannot set LEDs');
      }
      console.log('TEST ABORTED');
      await this.props.stopLogging();	  
    }
  }

  resetLight(){
    let i = this.state.intensity;
    let b = this.state.startBlue;
    this.lightState =   [0,0,0,0,b,i,0,0,0,0,0,0,0,b,i,0,0,0];
    this.props.sendLEDUpdate(this.lightState);
  }

  setLightOff(){
    let i = this.state.intensity;
    this.lightState = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    this.props.sendLEDUpdate(this.lightState);
  }

  moveToBlue(){
    if (this.lightState[5] || this.lightState[8]){ //red or green still on

        if (this.lightState[4] < this.state.intensity + this.state.bIntensity){
            this.lightState[4] +=1;
            this.lightState[13] +=1;
        }

        this.lightState[5] -=1;
        this.lightState[14] -=1;

        this.props.sendLEDUpdate(this.lightState);
        console.log('sent', this.lightState);

    } else {
        console.log('ALREADY BLUE');
        this.props.dataLog('u', ['VIDGAME', 'FINISHED_TRANSITION']);
        this.transitioning = false;
    }
  }

  changeColor(){
      console.log('change color');

      if (!this.transitioning && this.state.startBlue == this.lightState[4]){
          this.props.dataLog('u', ['VIDGAME', 'START_TRANSITION']);
          this.transitioning = true;
      }
      if (this.transitioning){
        this.moveToBlue();
        this.timer = setTimeout(this.changeColor.bind(this), this.state.stepInterval);
      }
  }

  async feltStimuli(){
      await this.props.dataLog('u', ['VIDGAME', 'NOTICED', 'RGB', this.lightState[8], this.lightState[5], this.lightState[4]]);
      console.log('felt it');
      clearTimeout(this.timer);
      this.resetLight();
      this.transitioning = false;
      this.setState({popover: true});
  }

  base64ToHex(str) {
    const raw = atob(str);
    let result = '';
    for (let i = 0; i < raw.length; i++) {
        const hex = raw.charCodeAt(i).toString(16);
        result += (hex.length === 2 ? hex : '0' + hex);
    }
    return result.toUpperCase();
  }

  hexToBase64(str) {
    return btoa(str.match(/\w{2}/g).map(function(a) {
        return String.fromCharCode(parseInt(a, 16));
    }).join(""));
  }

  decimalToHex(d, padding=2) {
    var hex = Number(d).toString(16);
    padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

    while (hex.length < padding) {
        hex = "0" + hex;
    }

    return hex;
  }

  bytesToHex(bytes) {
    for (var hex = [], i = 0; i < bytes.length; i++) {
      var current = bytes[i] < 0 ? bytes[i] + 256 : bytes[i];
      hex.push((current >>> 4).toString(16));
      hex.push((current & 0xf).toString(16));
    }
    return hex.join("");
  }


  getMainInterval(){
    //return random value in 5 min window around this.state.mainInterval (17.5-22.5 min for 20 min)	  

    let mins =  this.state.mainInterval;
    mins += (Math.random() * 5) - 2.5;
    return Math.round(mins*60*1000);
  }

  async resumeTest(gamenum){
      console.log('RESUME TEST');
      this.resetLight();

      switch(videogameSessionState[this.state.currentState]){
		case 'off':
		case 'game1A':
		case 'game1B':
		      	await this.props.startLogging('VIDGAME1_RESUME');	  
			break;
		case 'game2A':
		case 'game2B':
		      	await this.props.startLogging('VIDGAME2_RESUME');	  
			break;
	}

      await this.props.dataLog('u', ['VIDGAME',
          'START_TEST',
          JSON.stringify({stepInterval: this.state.stepInterval}),
          JSON.stringify({startBlue: this.state.startBlue}),
          JSON.stringify({intensity: this.state.intensity}),
          JSON.stringify({bIntensity: this.state.bIntensity})
      ]);

      this.setState({testRunning: true});
      this.timer = setTimeout(this.changeColor.bind(this), this.getMainInterval());
  }

  async pauseTest(){
      clearTimeout(this.timer);
      this.setState({popover: true, uploading:true, testRunning: false});
      await this.props.dataLog('u', ['VIDGAME', 'STOP_TEST']);
      try {	  
	      this.setLightOff();
      }catch(e){
	console.log('pause came from disconnect; cannot set LEDs');
      }
      console.log('TEST ABORTED');
      await this.props.stopLogging();	  
      this.setState({popover: false, uploading:false});
  }

  toggleTest(){
    if (this.state.testRunning){
        this.pauseTest();
    }else{
        this.resumeTest();
    }
  }

  async startTest(){
      console.log('START TEST');
      if (this.props.glassesStatus == 'Connected.'){	  
	      console.log('glasses connected, can start test');
	      this.resetLight();
	      await this.props.dataLog('u', ['VIDGAME',
		  'START_TEST',
		  JSON.stringify({stepInterval: this.state.stepInterval}),
		  JSON.stringify({startBlue: this.state.startBlue}),
		  JSON.stringify({intensity: this.state.intensity}),
		  JSON.stringify({bIntensity: this.state.bIntensity})
	      ]);

	      this.setState({testRunning: true});
	      this.timer = setTimeout(this.changeColor.bind(this), this.getMainInterval());
      } else { //no glasses connection, don't start test
	      console.log('glasses not connected, can\'t start test');
	      this.props.setScanning(true);
	      await this.pauseTest();
      }
  }

  async writeSurveyResults(surveyResults){
	for (var i=0; i<surveyResults.length-1; i+=2){
		await this.props.dataLog('u', ['VIDGAME', 'SURVEY', surveyResults[i], surveyResults[i+1]]);
	}
	return;  
  }

  async surveyDone(surveyResults) {
	
	var time = Date.now();  

	console.log('Game State = ' + videogameSessionState[this.state.currentState]);  
	console.log(surveyResults);
	  
	switch(videogameSessionState[this.state.currentState]){
		case 'off':
			//open initial file, write survey data, start session (start timer, turn on light)
		        this.setState({uploading: true, testRunning: false});
		      	await this.props.startLogging('VIDGAME1');	  
			await this.props.dataLog('u',['VIDGAME', 'SURVEY', time, 'StartVideoGameSurvey']);
			await this.writeSurveyResults(surveyResults);
			this.setState((prevState) => ({popover: false, uploading:false, currentState:prevState.currentState+1}));
			await this.startTest();
			break;
		case 'game1A':
			//write survey data, close file and continue file, write 'continuation' log, restart session
		        this.setState({uploading: true, testRunning: false});
			await this.props.dataLog('u',['VIDGAME', 'SURVEY', time, 'MidGame1Survey']);
			await this.writeSurveyResults(surveyResults);
		        await this.props.sendToStorage();
			await this.props.log('SESSION','CONTINUATION')	  
			this.setState((prevState) => ({popover: false, uploading:false, currentState:prevState.currentState+1}));
			await this.startTest();
			break;
		case 'game1B':
			//write survey data, close file and new filename,  restart session
		        this.setState({uploading: true, testRunning: false});
			await this.props.dataLog('u',['VIDGAME', 'SURVEY', time, 'EndGame1Survey']);
			await this.writeSurveyResults(surveyResults);
		        await this.props.stopLogging();	  
		      	await this.props.startLogging('VIDGAME2');	  
			this.setState((prevState) => ({popover: false, uploading:false, currentState:prevState.currentState+1}));
			await this.startTest();
			break;
		case 'game2A':
			//write survey data, close file and continue file, write 'continuation' log, restart session
		        this.setState({uploading: true, testRunning: false});
			await this.props.dataLog('u',['VIDGAME', 'SURVEY', time, 'MidGame2Survey']);
			await this.writeSurveyResults(surveyResults);
		        await this.props.sendToStorage();
			await this.props.log('SESSION','CONTINUATION')	  
			this.setState((prevState) => ({popover: false, uploading:false, currentState:prevState.currentState+1}));
			await this.startTest();
			break;
		case 'game2B':
			//write survey data, close file and end
		        this.setState({uploading: true, testRunning: false});
			await this.props.dataLog('u',['VIDGAME', 'SURVEY', time, 'EndGame2Survey']);
			await this.writeSurveyResults(surveyResults);
		        await this.props.stopLogging();	  
			this.setState((prevState) => ({uploading:false, currentState:prevState.currentState+1}));
			break;
	}
  }

  render() {
    return (
      <ScrollView>
	 <NavCallbackComponent {...this.props}/>   

	 <Modal isVisible={this.state.popover} propogateSwipe backdropOpacity={1.0} backdropColor="white">
            {this.state.uploading ?
	    <>
                <Text style={{width:'100%', padding:10, paddingTop:5, height: 30, textAlign:'center', alignItems:'center', justifyContent:'center'}}>
                    UPLOADING... please wait. 
                </Text>
	    </>:<>
		{this.state.currentState==0 && <StartVideogameSurvey    
		    onSubmitted={(surveyResults) => {this.surveyDone(surveyResults);}}/>}
		{this.state.currentState==1 && <MidGameSurvey    
		    onSubmitted={(surveyResults) => {this.surveyDone(surveyResults);}}/>}
		{this.state.currentState==2 && <EndGame1Survey    
		    onSubmitted={(surveyResults) => {this.surveyDone(surveyResults);}}/>}
		{this.state.currentState==3 && <MidGameSurvey    
		    onSubmitted={(surveyResults) => {this.surveyDone(surveyResults);}}/>}
		{this.state.currentState==4 && <EndGame2Survey    
		    onSubmitted={(surveyResults) => {this.surveyDone(surveyResults);}}/>}

	       {this.state.currentState==5 ? <>
			<Text style={{width:'100%', padding:10, paddingTop:5, textAlign:'center', alignItems:'center', justifyContent:'center'}}>
			   Completed! Thank you!  {"\n\n"} Please exit this screen or the app! {"\n\n"} Don't forget to charge your wearables! {"\n\n"}
			</Text>
			<Button title="OK" onPress={() => {this.setState({popover:false, currentState: 0})}}/>
	       </>:<></>}
	   </>}
        </Modal>



        <View style={styles.viewContainer}>
          <View style={{height:115, width:'100%'}}>

          <StatusView
                glassesStatus={this.props.glassesStatus}
                watchStatus={this.props.watchStatus}
                firebaseSignedIn={this.props.firebaseSignedIn}
                username={this.props.username}
                setUsername={this.props.setUsername}
	        pic={this.props.scanning?"error":"bluetooth"} 
	        connect={this.props.connect}/>
        </View>


        <View style={{width:'100%', height:150, flexGrow:1, flex:1, flexDirection:'row', justifyContent:'center', alignItems:'center'}}>

        <TouchableOpacity
          style={styles.bigbuttonStyleLarge}
          activeOpacity={0.5}
          onPress={() => this.toggleTest()}>
            {this.state.testRunning ?
                <Image source={require('../icons/file_progress.png')}
                    style={{width:'100%', height: undefined, aspectRatio:1}}/>:
                <Image source={require('../icons/file_stopped.png')}
                    style={{width:'100%', height: undefined, aspectRatio:1}}/>}
        </TouchableOpacity>

        <TouchableOpacity
          style={{...styles.bigbuttonStyleLarge, opacity:this.state.testRunning?1:0.3}}
	  disabled={!this.state.testRunning}  
          activeOpacity={0.5}
          onPress={() => this.feltStimuli()}>
            <Image source={require('../icons/shocked.png')}
                style={{width:'100%', height: undefined, aspectRatio:1}}/>
        </TouchableOpacity>
        </View>

        <View style={{width:'100%', flexGrow:1, flex:1, flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
            <Text style={{margin:15, fontSize:15}}> Click the face when you notice the light is blue.</Text>
        </View>

        <View style={{width:'100%', flexGrow:1, flex:1, flexDirection:'row', justifyContent:'center', alignItems:'center'}}>

        {this.state.testRunning ?
            <Text style={{margin:15, fontSize:20, color:'green'}}> Test In Progress...</Text>:
            <Text style={{margin:15, fontSize:20, color:'red'}}> Test Paused.</Text>
        }
        </View>

        <View style={styles.separator} />

        <View style={{width:'100%', minHeight:150, flexGrow:1, flex:1, flexDirection:'row', justifyContent:'center', alignItems:'center'}}>

            <TextInput style={{ backgroundColor: '#ededed', height: 34, width: '60%', margin:5, borderColor: '#7a42f4', borderWidth: 1}} autoCapitalize = 'none'
                value ={this.state.notes}
                multiline={true}
                onChangeText = {text => this.setState({notes:text})}/>
        </View>



        </View>
      </ScrollView>
    )
  }
};


function NavCallbackComponent(props){

    useFocusEffect(
	    React.useCallback(() => {
		console.log('CALLED WORKSESSION FOCUS');

		if (!props.scanning && (props.watchStatus != 'Connected.' || props.glassesStatus != 'Connected.')){
			console.log('glasses or watch not connected and not scanning; start');
			props.setScanning(true);
		}

		if (props.scanning && props.watchStatus == 'Connected.' && props.glassesStatus == 'Connected.'){
			  console.log('scanning but glasses and watch connected; stop');
			  props.setScanning(false);
		}

	    }, [])
    );

    return null;
}
