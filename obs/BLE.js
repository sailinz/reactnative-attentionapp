//BLE.js

//VIBRATES : 5, 7, 12, 25 in duration, 36 'timeoff', intensity >= 30

//FOR Vibration:
//start at duration = 5, go in increments of 5 fast up until notice
//
//
//
// per test: bottom (always miss), top (always good), others.
// step 1. find range

// look for 5 misses or 5 makes
// up by 5 from 30
// if lowest is noticed or highest is not noticed, quit

//ping pong back and forth between these two values 5 times.
//if lower noticed, step down.
//if upper not noticed, step up.
//do until 5/5 for each. mix in random if one is completed.
//
//given top and bottom and current state, get 10 samples for each level between
//top and bottom.
//
//print them in console.


//wait main interval initially or after felt.
//when noticed, record:

// start of change time
// noticed time
// noticed intensity (blue/red/green)

// need 'threshold of notice change'



//Step 2. 

import React, { Component }  from 'react';
import {
  View,
  Text,
  Button,
  Image,
  Switch,
  TouchableOpacity,
  TextInput,
  RNCSlider
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage'

import {decode as atob, encode as btoa} from 'base-64'
//import { btoa, atob } from 'react-native-quick-base64';

import Slider from "@react-native-community/slider";
import Likert from 'react-likert-scale';
import Popover, { Rect } from 'react-native-popover-view';
import { BleManager } from "react-native-ble-plx";
import styles from "./Styles";


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

const pavlok_ids = {
    BATTERY_SERVICE_UUID: "0000180f-0000-1000-8000-00805f9b34fb",
    BATTERY_CHAR_UUID: "00002a19-0000-1000-8000-00805f9b34fb",
    MAIN_SERVICE_UUID: "156e1000-a300-4fea-897b-86f698d74461",
    MAIN_VIBRATE_CHAR_UUID: "00001001-0000-1000-8000-00805f9b34fb",
    MAIN_BEEP_CHAR_UUID: "00001002-0000-1000-8000-00805f9b34fb",
    MAIN_ZAP_CHAR_UUID: "00001003-0000-1000-8000-00805f9b34fb",
    MAIN_LED_CHAR_UUID: "00001004-0000-1000-8000-00805f9b34fb"
}

const CAPTIVATES_SERVICE_UUID = "0000fe80-8e22-4541-9d4c-21edae82ed19";
const CAPTIVATES_LED_UUID = "0000fe84-8e22-4541-9d4c-21edae82ed19";

export default class BLE extends Component {

  constructor() {

    super()
    this.manager = new BleManager()
    this.state = {info: "", battery: "?", intensity: 220, startBlue: 25, bIntensity: 5,
                  mainInterval: 1, stepInterval: 300, testRunning: false, results:[]};
    this.ble_devices = {};
    this.ledChar = null;
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

    this.sendLEDUpdate(this.lightState);
  }

  setLightOff(){
    let i = this.state.intensity;
    this.lightState = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    this.sendLEDUpdate(this.lightState);
  }

  moveToBlue(){
    if (this.lightState[5] || this.lightState[8]){ //red or green still on

        /*
        //increment blue by 1 on both sides
        this.lightState[4] += 1;
        this.lightState[13] += 1;

        if (this.rg_toggle){ //decrement red
            this.lightState[8] -= 1;
            this.lightState[17] -= 1;
        } else { //decrement green
            this.lightState[5] -= 1;
            this.lightState[14] -= 1;
        }

        this.rg_toggle = !this.rg_toggle;
        */
        if (this.lightState[4] < this.state.intensity + this.state.bIntensity){
            this.lightState[4] +=1;
            this.lightState[13] +=1;
        }

        this.lightState[5] -=1;
        this.lightState[14] -=1;

        this.sendLEDUpdate(this.lightState);
        console.log('sent', this.lightState);

    } else {
        console.log('ALREADY BLUE');
        this.updateResults({event:'finishTransition'});
        this.transitioning = false;
    }
  }

  sendLEDUpdate(ledArray){
    this.ledChar.writeWithoutResponse(this.hexToBase64(this.bytesToHex(ledArray.slice(0))), null);
  }

  updateResults(dict_item){
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
  }

  info(message) {
    this.setState({info: message})
  }

  error(message) {
    this.setState({info: "ERROR: " + message})
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
    let mins =  1;
    mins += Math.random() * 14;
    return Math.round(mins*60*1000);
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
          mainInterval: this.state.mainInterval,
          stepInterval: this.state.stepInterval,
          intensity: this.state.intensity
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


  componentDidMount() {
    if (Platform.OS === 'ios') {
      this.manager.onStateChange((state) => {
        if (state === 'PoweredOn') this.scanAndConnect()
      })
    } else {
      this.scanAndConnect()
    }
  }


  scanAndConnect() {
    console.log('scan and connect called');

    this.manager.startDeviceScan(null,
                                 null, (error, device) => {
      this.info("Scanning...")
      console.log(device)

      if (error) {
        this.error(error.message)
        return
      }

      this.ble_devices[device.id] = {
            'name': device.name,
            'rssi': device.rssi
      }

      if (device.name) {
      if (device.name.includes('CAPTIVATE')) {
        this.info("Connecting to Captivates")
        this.manager.stopDeviceScan()

        device.connect()
        .then((device) => {

            device.onDisconnected((error, disconnectedDevice) => {
                        console.log('disconnection event');
                        this.stopTest();
                        setTimeout(this.scanAndConnect.bind(this), 5000);
            })


            this.info("Discovering Services and Characteristics")
            let r = device.discoverAllServicesAndCharacteristics()
            console.log(r)
            return r
        })
        .then((device) => {
            device.services()
            .then((services) => {
                for (s in services){
                    if (services[s].uuid == CAPTIVATES_SERVICE_UUID){
                        console.log('found main service');
                        device.characteristicsForService(services[s].uuid).then((c)=> {
                            for (var i in c){
                                if (c[i].uuid === CAPTIVATES_LED_UUID){
                                    console.log('found LED characteristic');
                                    this.ledChar = c[i];
                                }
                            }

                        })

                    }
            }
            })
        })
        .then(() => {
            this.info("Listening")
        }, (error) => {
            this.error(error.message)
            this.info(error.message)
        })
      }}
    })
  }

  render() {
    return (
      <View>
        <View style={{width:'100%', height: 50, flexGrow:1, flex:1, flexDirection:'row', alignItems:'center'}}>
            <View style={{width:'50%'}}>
                <Text>{this.state.info}</Text>
            </View>
        </View>


        <View style={{width:'100%', marginTop:5, flexGrow:1, flex:1, flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
        <Text>CAPTIVATES TEST APPLICATION</Text>
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

        <View style={styles.separator} />

        <View style={{height:150, width:'100%', flexGrow:1, flex:1, flexDirection:'row', justifyContent:'center', alignItems:'center'}}>

        <TouchableOpacity
          style={styles.bigbuttonStyle}
          activeOpacity={0.5}
          onPress={() => this.toggleTest()}>
            {this.state.testRunning ?
                <Image source={require('./icons/file_progress.png')}
                    style={{width:'100%', height: undefined, aspectRatio:1}}/>:
                <Image source={require('./icons/file_stopped.png')}
                    style={{width:'100%', height: undefined, aspectRatio:1}}/>}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bigbuttonStyle}
          activeOpacity={0.5}
          onPress={() => this.feltStimuli()}>
            <Image source={require('./icons/shocked.png')}
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


        <View>
        {this.state.results.map((val, index) => {
                return (<Text style={{width:'100%', textAlign:'left'}} key={index}>{val['timestamp']}: {val['event']}</Text>)
        })}
        </View>

      </View>
    )
  }
};


