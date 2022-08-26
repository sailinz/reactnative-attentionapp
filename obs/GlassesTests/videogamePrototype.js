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

import Modal from "react-native-modal";

import TestStartVideogameSurvey from "../Surveys/TestStartVideogameSurvey";
import TestEndGameSurvey from "../Surveys/TestEndGameSurvey";

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



const videogameSessionState = ['off', 'game1B', 'complete'];


export default class WorkingSession extends React.Component {
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
  }


  async componentWillUnmount(){
    if (this.state.testRunning){
        await this.pauseTest();
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
    //return random value in 10 min window around this.state.mainInterval (15-25 min for 20 min)	  

    let mins =  this.state.mainInterval;
    mins += (Math.random() * 10) - 5;
    return Math.round(mins*60*1000);
  }

  async resumeTest(gamenum){
      console.log('RESUME TEST');
      this.resetLight();

      await this.props.startLogging('VIDGAME1_RESUME');	  

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
      this.setLightOff();
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
		case 'game1B':
			//write survey data, close file and new filename,  restart session
		        this.setState({uploading: true, testRunning: false});
			await this.props.dataLog('u',['VIDGAME', 'SURVEY', time, 'EndGame1Survey']);
			await this.writeSurveyResults(surveyResults);
		        await this.props.stopLogging();	  
			this.setState((prevState) => ({uploading:false, currentState:prevState.currentState+1}));
			break;
	}
  }

  render() {
    return (
      <ScrollView>

	 <Modal isVisible={this.state.popover} propogateSwipe backdropOpacity={1.0} backdropColor="white">
            {this.state.uploading ?
	    <>
                <Text style={{width:'100%', padding:10, paddingTop:5, height: 30, textAlign:'center', alignItems:'center', justifyContent:'center'}}>
                    UPLOADING... please wait. 
                </Text>
	    </>:<>
		{this.state.currentState==0 && <TestStartVideogameSurvey    
		    onSubmitted={(surveyResults) => {this.surveyDone(surveyResults);}}/>}
		{this.state.currentState==1 && <TestEndGameSurvey    
		    onSubmitted={(surveyResults) => {this.surveyDone(surveyResults);}}/>}
	       {this.state.currentState==2 ? <>
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
                setUsername={this.props.setUsername}/>
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

