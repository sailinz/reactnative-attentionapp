/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */


import {decode as atob, encode as btoa} from 'base-64'

import React from "react";
import styles from "../Styles";

import StatusView from "../StatusView.js";

import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Button,
  RNCSlider,
  TouchableOpacity,
  TextInput,
  Image,
} from "react-native";

import Popover, { Rect } from 'react-native-popover-view';

import Slider from "@react-native-community/slider";

const optMap = {
    1: 'very low',
    2: 'low',
    3: 'average',
    4: 'high',
    5: 'very high'
};

const emoMap = {
    1: 'very negative',
    2: 'negative',
    3: 'nuetral',
    4: 'positive',
    5: 'very positive'
};



export default class PavlokCalibrate extends React.Component {
  constructor(props) {
    super(props);
    this.state = {sliderValue: 35, showSettings: false, showExtraSettings: false,
                  testRunning: false, step: 1, popover: false,
                  mainIntervalMin:1, mainIntervalMax:5, stepIntervalSecMin:15, stepIntervalSecMax:65,
                  surveyFocus:-1, surveyAlertness:-1, surveyEmotion:-1, results: []};
    this.timer = null;
    this.currentLevel = 0;
    this.currentOffset = 0;
    this.blepaused = false;
    this.lastEvent = 0;
  }

  sendVibrateAndLog(intensity){
    var timestamp = new Date();
    this.props.addData(timestamp, 'PAV_TEST', 'VIB', [intensity, this.props.pavlokTimeOn], this.props.username);
    this.props.sendVibrate(intensity);
    this.setState(prevState => ({results: [...prevState.results, [timestamp, 'VIB', intensity]]}));
  }

  sendVibrateSlider(){
    this.props.sendVibrate(this.state.sliderValue);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.pavlokBleState == 'Connected.' && prevProps.pavlokBleState !== this.props.pavlokBleState) {
        //jumped off of connection, pause.
        this.blepaused=true;
        clearTimeout(this.timer);
        this.setState({testRunning: false});
    } else if (this.props.pavlokBleState == 'Connected.' && prevProps.pavlokBleState !== this.props.pavlokBleState) {
        //jumped to connection, check if we should unpause.
        if(this.blepaused){
            this.blepaused = false;
            this.startTest();
        }
    }
  }

  toggleShowSettings(){
   this.setState(prevState => ({showSettings: !prevState.showSettings}));
  }

  toggleShowExtraSettings(){
   this.setState(prevState => ({showExtraSettings: !prevState.showExtraSettings}));
  }

  getMainInterval(){
    let mins =  this.state.mainIntervalMin;
    mins += Math.random() * (this.state.mainIntervalMax - this.state.mainIntervalMin);
    return Math.round(mins*60*1000);
  }

  getStepInterval(){
    let secs = this.state.stepIntervalSecMin;
    secs += Math.random() * (this.state.stepIntervalSecMax - this.state.stepIntervalSecMin);
    return Math.round(secs*1000);
  }

  testTimerCalled(){
    console.log('test timer called');
    console.log(this.currentLevel);
    console.log(this.currentOffset);
    console.log(this.state);
    if (this.currentLevel >= 100){
        //catch no one home
        console.log('error');
        this.setState({testRunning: false});

    }else{
        //main timer called, keep calling this over and over
        //with increasing shocks
        let tempsendlevel = this.currentLevel - this.currentOffset;

        this.sendVibrateAndLog(tempsendlevel);

        if (this.currentOffset == 0){
            this.currentLevel += this.state.step;
            this.currentOffset = 3;
        } else {
            this.currentOffset -= 1;
        }
        this.lastEvent = new Date();
        console.log('event time = ', this.lastEvent);
        this.timer = setTimeout(this.testTimerCalled.bind(this), this.getStepInterval());

    }
  }

  startTest(){
      console.log('start test');
      this.setState({testRunning: true});
      this.currentLevel = this.props.pavlokMinStrength;
      this.timer = setTimeout(this.testTimerCalled.bind(this), this.getMainInterval());
  }

  feltStimuli(){
      let timenow = new Date();
      console.log('button press:', timenow);
      console.log('button response (sec):', (timenow - this.lastEvent)/1000);
      //button press that we felt; stop increasing sensing, send 'felt' log,
      //reset intensity to lowest, call long main timer with random interval
      if (timenow - this.lastEvent <= 10000){
            console.log('real reaction! restart');
            clearTimeout(this.timer);
            var timestamp = new Date();
            this.props.addData(timestamp, 'PAV_TEST', 'FELT', [-1], this.props.username);
            this.setState(prevState => ({results: [...prevState.results, [timestamp, 'FELT', -1]]}));

            if (this.currentLevel > this.props.pavlokMinStrength){
                this.currentLevel -= (5-this.currentOffset);
                this.currentOffset = 0;
            }else{
                this.currentLevel = this.props.pavlokMinStrength;
                this.currentOffset = 0;
            }

            this.timer = setTimeout(this.testTimerCalled.bind(this), this.getMainInterval());
      }else {
            console.log('phantom press!');
            var timestamp = new Date();
            this.props.addData(timestamp, 'PAV_TEST', 'PHANTOM', [-1], this.props.username);
            this.setState(prevState => ({results: [...prevState.results, [timestamp, 'PHANTOM', -1]]}));
      }
      this.setState({popover: true});
  }

  stopTest(){
      clearTimeout(this.timer);
      this.setState({testRunning: false});
  }

  toggleTest(){
    if (this.state.testRunning){
        this.stopTest();
    }else{
        this.startTest();
    }
  }

  processRawEvent(e) {
      var print_data = e[0].toLocaleString("en-US",{hour12:false}) + ": ";
      print_data = print_data + e[1] + " | " + e[2];
      return print_data;
  }

  closePopover(){
    var timestamp = new Date();
    var surveyAnswers = String(this.state.surveyFocus) + String(this.state.surveyAlertness) + String(this.state.surveyEmotion);
    this.setState({'popover': false});
    this.props.addData(timestamp, 'PAV_TEST', 'SURVEY', [this.state.surveyFocus, this.state.surveyAlertness, this.state.surveyEmotion], this.props.username);
    this.setState(prevState => ({results: [...prevState.results, [timestamp, 'SURVEY', surveyAnswers]]}));
  }

  render() {
    return (
      <ScrollView>

      <Popover from={new Rect(5, 100, 30, 400)} isVisible={this.state.popover} onRequestClose={() => this.setState({popover: false})}>
            <View style={{width:290, height:50, padding:5, justifyContent:'center', alignItems:'center'}}>
            <Text style={{width:290}}>Focus: {optMap[this.state.surveyFocus]}</Text>
            </View>
            <Slider
            onValueChange={sliderValue => this.setState({surveyFocus:parseInt(sliderValue)})}
            minimumValue={1}
            maximumValue={5}
            step={1}
            value={this.state.surveyFocus}
            style={{width:"80%", marginHorizontal:"10%"}}
            />
            <View style={{width:290, height:50, padding:5, justifyContent:'center', alignItems:'center'}}>
            <Text style={{width:290}}>Alertness: {optMap[this.state.surveyAlertness]}</Text>
            </View>
            <Slider
            onValueChange={sliderValue => this.setState({surveyAlertness:parseInt(sliderValue)})}
            minimumValue={1}
            maximumValue={5}
            step={1}
            value={this.state.surveyAlertness}
            style={{width:"80%", marginHorizontal:"10%"}}
            />
            <View style={{width:290, height:50, padding:5, justifyContent:'center', alignItems:'center'}}>
            <Text style={{width:290}}>Emotion: {emoMap[this.state.surveyEmotion]}</Text>
            </View>
            <Slider
            onValueChange={sliderValue => this.setState({surveyEmotion:parseInt(sliderValue)})}
            minimumValue={1}
            maximumValue={5}
            step={1}
            value={this.state.surveyEmotion}
            style={{width:"80%", marginHorizontal:"10%"}}
            />
            <View style={{width:'100%', height:50, padding:5, justifyContent:'center', alignItems:'center'}}>
            <TouchableOpacity
            activeOpacity={0.5}
            onPress={this.closePopover.bind(this)}>
                <Text style={{width:'100%', padding:10, paddingTop:5, height: 30, borderColor: '#7a42f4', borderWidth: 1, textAlign:'center', alignItems:'center', justifyContent:'center'}}>
                    Close
                </Text>
            </TouchableOpacity>
            </View>
        </Popover>

        <View style={{width:'100%', height: 80, flexGrow:1, flex:1, flexDirection:'row', alignItems:'center'}}>
          <View style={{height:115, width:'100%'}}>

            <StatusView
                    pavlokStatus={this.props.pavlokStatus}
                    firebaseSignedIn={this.props.firebaseSignedIn}
                    username={this.props.username}
                    setUsername={this.props.setUsername}/>
            </View>
          </View>
          <View style={{height:85, flex:1, width:'100%'}}>
            <View style={{width:'50%'}}>
                <Text></Text>
            </View>
            <View style={{width:'100%',flex:1, flexDirection:'row', justifyContent: 'flex-end'}}>
                    <Text style={{fontSize:10}}>
                            {"\nbattery: " + (this.props.pavlokBattery) + "%   "}
                    </Text>
                <View style={{width:30, height:30,marginRight:5}}>
                    {this.props.pavlokBattery > 20 ?
                        <Image source={require('../icons/full-battery.png')}
                            style={{width:'100%', height: undefined, aspectRatio:1}}/>:
                        <Image source={require('../icons/low-battery.png')}
                            style={{width:'100%', height: undefined, aspectRatio:1}}/>
                    }
                </View>
            </View>
        </View>




        <View style={{width:'100%', marginTop:5, flexGrow:1, flex:1, flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
        <Text>Intensity: {this.state.sliderValue}</Text>
        </View>

        <Slider
        animateTransitions
        animationType="timing"
        onValueChange={sliderValue => this.setState({sliderValue:parseInt(sliderValue)})}
        minimumValue={0}
        maximumValue={100}
        step={1}
        value={this.state.sliderValue}
        style={{width:"80%", marginHorizontal:"10%"}}
        />

        <View style={{width:'100%', marginTop:5, flexGrow:1, flex:1, flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
        <Text>TimeActive: {this.props.pavlokTimeOn}</Text>
        </View>

        <Slider
        animateTransitions
        animationType="timing"
        onValueChange={timeon => this.props.setPavlokTimeOn(timeon)}
        minimumValue={0}
        maximumValue={100}
        step={1}
        value={this.props.pavlokTimeOn}
        style={{width:"80%", marginHorizontal:"10%"}}
        />


        <View style={{height:100, width:'100%', flexGrow:1, flex:1, flexDirection:'row', justifyContent:'center', alignItems:'center'}}>

        <TouchableOpacity
          style={styles.bigbuttonStyleWide}
          activeOpacity={0.5}
          onPress={() => this.sendVibrateSlider()}>
            <Image source={require('../icons/equalizer.png')}
                style={{width: undefined, height: '75%', aspectRatio:1}}/>
            <Text>Vibrate</Text>
        </TouchableOpacity>

        </View>

        <View style={styles.separator} />


        <View style={{height:150, width:'100%', flexGrow:1, flex:1, flexDirection:'row', justifyContent:'center', alignItems:'center'}}>

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
          style={styles.bigbuttonStyleLarge}
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




        <View style={{width:'100%', height:50, padding:5, justifyContent:'center', alignItems:'center'}}>
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => this.toggleShowSettings()}>
            <Text style={{width:'100%', padding:10, paddingTop:5, height: 30, borderColor: '#7a42f4', borderWidth: 1, textAlign:'center', alignItems:'center', justifyContent:'center'}}>
                SHOW SETTINGS AND LOG
            </Text>
        </TouchableOpacity>
        </View>

        {this.state.showSettings ?
        <View>

        <View style={{width:'100%', marginTop:5, flexGrow:1, flex:1, flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
        <Text>minStrength: {this.props.pavlokMinStrength}</Text>
        </View>

        <Slider
        animateTransitions
        animationType="timing"
        onValueChange={sliderValue => this.props.setPavlokMinStrength(sliderValue)}
        minimumValue={10}
        maximumValue={80}
        step={1}
        value={this.props.pavlokMinStrength}
        style={{width:"80%", marginHorizontal:"10%"}}
        />



        <View style={{width:'100%', height:50, padding:5, justifyContent:'center', alignItems:'center'}}>
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => this.toggleShowExtraSettings()}>
            <Text style={{width:'100%', padding:10, paddingTop:5, height: 30, borderColor: '#7a42f4', borderWidth: 1, textAlign:'center', alignItems:'center', justifyContent:'center'}}>
                ADDED DEBUG SETTINGS
            </Text>
        </TouchableOpacity>
        </View>



        {this.state.showExtraSettings ?
        <View>
        <View style={{width:'100%', marginTop:5, flexGrow:1, flex:1, flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
        <Text>step: {this.state.step}</Text>
        </View>

        <Slider
        animateTransitions
        animationType="timing"
        onValueChange={sliderValue => this.setState({step:parseInt(sliderValue)})}
        minimumValue={1}
        maximumValue={10}
        step={1}
        value={this.state.step}
        style={{width:"80%", marginHorizontal:"10%"}}
        />


        <View style={{width:'100%', marginTop:5, flexGrow:1, flex:1, flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
        <Text>MainIntervalMin (min): {this.state.mainIntervalMin}</Text>
        </View>

        <Slider
        animateTransitions
        animationType="timing"
        onValueChange={sliderValue => this.setState({mainIntervalMin:parseInt(sliderValue)})}
        minimumValue={0}
        maximumValue={30}
        step={1}
        value={this.state.mainIntervalMin}
        style={{width:"80%", marginHorizontal:"10%"}}
        />


        <View style={{width:'100%', marginTop:5, flexGrow:1, flex:1, flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
        <Text>MainIntervalMax: {this.state.mainIntervalMax}</Text>
        </View>

        <Slider
        animateTransitions
        animationType="timing"
        onValueChange={sliderValue => this.setState({mainIntervalMax:parseInt(sliderValue)})}
        minimumValue={1}
        maximumValue={75}
        step={1}
        value={this.state.mainIntervalMax}
        style={{width:"80%", marginHorizontal:"10%"}}
        />



        <View style={{width:'100%', marginTop:5, flexGrow:1, flex:1, flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
        <Text>StepIntervalMin (sec): {this.state.stepIntervalSecMin}</Text>
        </View>

        <Slider
        animateTransitions
        animationType="timing"
        onValueChange={sliderValue => this.setState({stepIntervalSecMin:parseInt(sliderValue)})}
        minimumValue={5}
        maximumValue={60}
        step={1}
        value={this.state.stepIntervalSecMin}
        style={{width:"80%", marginHorizontal:"10%"}}
        />


        <View style={{width:'100%', marginTop:5, flexGrow:1, flex:1, flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
        <Text>StepIntervalMax: {this.state.stepIntervalSecMax}</Text>
        </View>

        <Slider
        animateTransitions
        animationType="timing"
        onValueChange={sliderValue => this.setState({stepIntervalSecMax:parseInt(sliderValue)})}
        minimumValue={1}
        maximumValue={180}
        step={1}
        value={this.state.stepIntervalSecMax}
        style={{width:"80%", marginHorizontal:"10%"}}
        />
        </View>:
        <View></View>}


        <View>
        {this.state.results.map((e) => {
                let val = this.processRawEvent(e);
                return (<Text style={{width:'100%', textAlign:'left'}} key={val}>{val}</Text>)
        })}
        </View>
        </View>:
        <View></View> }

      </ScrollView>
    )
  }
};

