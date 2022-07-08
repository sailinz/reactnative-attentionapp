
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
  TouchableOpacity,
  TextInput,
  Image,
} from "react-native";

import Slider from "@react-native-community/slider";

const TOTAL_SAMPLES=16;

export default class GlassesCalibrate extends React.Component {
  constructor(props) {
    super(props);
    this.state = {intensity: 170, startBlue: 70, bIntensity: 50, samples:0, notes: '',
                  mainInterval: 1, stepInterval: 100, testRunning: false, results:[]};
    this.timer = null;

                    // 0, 0, 0, 0,lB,lG, 0, 0,lR, 0, 0, 0, 0,rB,rG, 0, 0,rR]
    this.lightState = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    this.rg_toggle = true;
    this.transitioning= false;
  }

  setLightWhite(){
    let i = this.state.intensity;
    let b = this.state.startBlue;
    //this.lightState = [0,0,0,0,i,i,0,0,i,0,0,0,0,i,i,0,0,i];
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
        this.updateResults({event:'finishTransition'});
        this.transitioning = false;
    }
  }

  updateResults(dict_item){
    var timestamp = new Date();
    if (dict_item['event'] == 'startTest'){
        this.props.addData(timestamp, 'CAP_CALB', dict_item['event'], [dict_item, this.state.notes], this.props.username);
    }else{
        this.props.addData(timestamp, 'CAP_CALB', dict_item['event'], [], this.props.username);
    }

    dict_item['timestamp'] = new Date().getTime();
    this.setState(prevState => ({results: [...prevState.results, dict_item]}));
  }

  changeColor(){
      console.log('change color');

      if (!this.transitioning && this.state.startBlue == this.lightState[4]){
          this.updateResults({event:'startTransition'});
          this.transitioning = true;
      }
      if (this.transitioning){
        this.moveToBlue();
        this.timer = setTimeout(this.changeColor.bind(this), this.state.stepInterval);
      }
  }

  feltStimuli(){
      console.log('felt it');
      clearTimeout(this.timer);
      this.updateResults({event:'noticed', rgb: [this.lightState[8], this.lightState[5], this.lightState[4]]});
      this.setLightWhite();
      this.transitioning = false;
      this.timer = setTimeout(this.changeColor.bind(this), this.getMainInterval());

      if (this.state.samples >= (TOTAL_SAMPLES-1)){
          //done
          this.stopTest();
          this.setState(prevState => {return {samples: 0}});
      }else{
        this.setState(prevState => {return {samples: prevState.samples + 1}});
      }
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
    let secs =  1;
    secs += Math.random() * 10;
    return Math.round(secs*1000);
  }

  getStepInterval(){
    let secs = 15;
    secs += Math.random() * 40;
    return Math.round(secs*1000);
  }

  startTest(){
      console.log('START TEST');
      this.setLightWhite();
      this.updateResults({
          event:'startTest',
          stepInterval: this.state.stepInterval,
          startBlue: this.state.startBlue,
          intensity: this.state.intensity,
          bIntensity: this.state.bIntensity
      });

      this.setState({testRunning: true});
      this.timer = setTimeout(this.changeColor.bind(this), this.getMainInterval());
  }

  stopTest(){
      clearTimeout(this.timer);
      this.setState({testRunning: false});
      this.updateResults({
          event:'stopTest'
      });
      this.setLightOff();
      console.log('TEST ABORTED');
  }

  toggleTest(){
    if (this.state.testRunning){
        this.stopTest();
    }else{
        this.startTest();
    }
  }

  render() {
    return (
      <ScrollView>
        <View style={styles.viewContainer}>
          <View style={{height:115, width:'100%'}}>

          <StatusView
                glassesStatus={this.props.glassesStatus}
                firebaseSignedIn={this.props.firebaseSignedIn}
                username={this.props.username}
                setUsername={this.props.setUsername}/>
        </View>

        <View style={{width:'100%', marginTop:5, flexGrow:1, flex:1, flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
        <Text>Intensity: {this.state.intensity}</Text>
        </View>

        <Slider
        animateTransitions
        animationType="timing"
        onValueChange={intensity => this.setState({intensity:parseInt(intensity)})}
        minimumValue={5}
        maximumValue={255}
        step={5}
        value={this.state.intensity}
        style={{width:"80%", marginHorizontal:"10%"}}
        />


        <View style={{width:'100%', marginTop:5, flexGrow:1, flex:1, flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
        <Text>Intensity Blue: {this.state.bIntensity}</Text>
        </View>

        <Slider
        animateTransitions
        animationType="timing"
        onValueChange={intensity => this.setState({bIntensity:parseInt(intensity)})}
        minimumValue={0}
        maximumValue={50}
        step={1}
        value={this.state.bIntensity}
        style={{width:"80%", marginHorizontal:"10%"}}
        />


        <View style={{width:'100%', marginTop:5, flexGrow:1, flex:1, flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
        <Text>Blue Start: {this.state.startBlue}</Text>
        </View>

        <Slider
        animateTransitions
        animationType="timing"
        onValueChange={intensity => this.setState({startBlue:parseInt(intensity)})}
        minimumValue={0}
        maximumValue={90}
        step={1}
        value={this.state.startBlue}
        style={{width:"80%", marginHorizontal:"10%"}}
        />

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

        <View style={{width:'100%', minHeight:150, flexGrow:1, flex:1, flexDirection:'row', justifyContent:'center', alignItems:'center'}}>

            <TextInput style={{ backgroundColor: '#ededed', height: 34, width: '60%', margin:5, borderColor: '#7a42f4', borderWidth: 1}} autoCapitalize = 'none'
                value ={this.state.notes}
                multiline={true}
                onChangeText = {text => this.setState({notes:text})}/>
        </View>

        <View>
        {this.state.results.map((val, index) => {
                return (<Text style={{width:'100%', textAlign:'left'}} key={index}>{val['timestamp']}: {val['event']}</Text>)
        })}
        </View>

        </View>
      </ScrollView>
    )
  }
};

