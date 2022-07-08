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

Array.prototype.shuffle = function() {
  var i = this.length, j, temp;
  if ( i == 0 ) return this;
  while ( --i ) {
     j = Math.floor( Math.random() * ( i + 1 ) );
     temp = this[i];
     this[i] = this[j];
     this[j] = temp;
  }
  return this;
}

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
    this.state = {sliderValue: 35, testRunning: false, results: []};
    this.timer = null;
    this.currentTest = {'min':25, 'max':100, 'current_level': 0, 'state':'s2', 'noticed':{}, 'next':[]};
    this.waitForBuzz = 0;
  }

  updateResults(noticed_dict){
    let result_dict = {};
    for (var key in noticed_dict){
        result_dict[key] = 100.0 * noticed_dict[key].reduce((pv, cv) => pv + cv, 0) / noticed_dict[key].length;
    }
    this.setState({results: result_dict});
  }

  noticedPushOrCreate(key, val){
    //helper function to update noticed array
    if(key in this.currentTest.noticed){
        this.currentTest.noticed[key].push(val);
    }else {
        this.currentTest.noticed[key] = [val];
    }
    this.updateResults(this.currentTest.noticed);
  }

  //Step 1. set initial min/max based on moving up by 5s
  calibratePart1(){
    console.log('calibrate 1.');
    this.currentTest.min +=5;
    this.sendVibrate(this.currentTest.min);
    this.timer = setTimeout(this.calibratePart1.bind(this), 3000);
  }

  nextBuzz() {
    this.waitForBuzz = 0;
    this.sendVibrate(this.currentTest.current_level);
    this.timer = setTimeout( this.calibratePart2.bind(this), 3000);
  }

  nextCal2(felt){
    //check if we're done.
    if (this.currentTest.noticed[this.currentTest.min].length >= 5 && this.currentTest.noticed[this.currentTest.max].length >= 5){
        console.log('finished calibration step 2');
        this.currentTest.state = 's3start';
        this.timer = setTimeout(this.calibratePart3.bind(this), 3000);

    } else {

        //else, toggle state
        if (this.currentTest.state == 's2min'){
            this.currentTest.state = 's2max';
        } else {
            this.currentTest.state = 's2min';
        }

        //set currentlevel
        if (this.currentTest.state == 's2min' && this.currentTest.noticed[this.currentTest.min].length < 5){
            this.currentTest.current_level = this.currentTest.min;
        } else if (this.currentTest.state == 's2max' && this.currentTest.noticed[this.currentTest.max].length < 5){
            this.currentTest.current_level = this.currentTest.max;
        } else {
            this.currentTest.current_level = Math.floor(Math.random() * (this.currentTest.max-this.currentTest.min-2)) + this.currentTest.min + 1;
        }

        //call vibrate
        if (felt){
            //if felt, need to wait 3 sec to vibrate
            //setTimeout(nextBuzz.bind(this), 3000);
            this.currentTest.state += 'temp';
            this.waitForBuzz = 1;
            this.timer = setTimeout(()=>{
                this.waitForBuzz = 0;
                this.currentTest.state = this.currentTest.state.replace('temp', '');
                this.sendVibrate(this.currentTest.current_level);
                this.timer = setTimeout( this.calibratePart2.bind(this), 3000);
            }, 3000);

        } else {
            //if not felt, send next vibrate immediately
            this.sendVibrate(this.currentTest.current_level);
            this.timer = setTimeout( this.calibratePart2.bind(this), 3000);
        }

    }

  }

  //Step 2. set initial min/max based on moving up by 5s
  calibratePart2(){
    console.log('calibrate 2.');

    this.waitForBuzz = 0;
    console.log(this.currentTest.noticed);

    //first buzz of part 2-- send minimum buzz and wait
    if (this.currentTest.state == 's2start'){
        this.currentTest.state = 's2min';
        this.currentTest.current_level = this.currentTest.min;
        this.sendVibrate(this.currentTest.min);
        this.timer = setTimeout(this.calibratePart2.bind(this), 3000);

    } else if (this.currentTest.state == 's2min'){
        //we didn't feel the minimum stimuli (good!)
        this.noticedPushOrCreate(this.currentTest.current_level, 0);
        this.nextCal2(0);

    } else if (this.currentTest.state == 's2max'){
        //we didn't feel the maximum stimuli (oops, bump it up)
        this.noticedPushOrCreate(this.currentTest.current_level, 0);
        if (this.currentTest.current_level == this.currentTest.max){
            this.currentTest.max += 1;
            this.currentTest.noticed[this.currentTest.max] = [];
        }
        this.nextCal2(0);
    }


  }

  nextBuzzCal3() {
    this.waitForBuzz = 0;
    this.sendVibrate(this.currentTest.current_level);
    this.timer = setTimeout(this.cal3notFelt.bind(this), 3000);
  }

  cal3notFelt(){

    console.log(this.currentTest.next);
    this.noticedPushOrCreate(this.currentTest.current_level, 0);

    if (this.currentTest.next.length){
        this.currentTest.current_level = this.currentTest.next.pop();
        this.sendVibrate(this.currentTest.current_level);
        this.timer = setTimeout(this.cal3notFelt.bind(this), 3000);
    } else {
        this.doneTest();
    }
  }

  doneTest(){
    console.log('done test');
    console.log(this.currentTest);
    console.log(this.currentTest.noticed);
    this.props.addData(new Date(), 'PAV_CALB', 'RESULTS', [this.currentTest.noticed, {'duration': this.props.pavlokTimeOn}], this.props.username);
    this.stopTest();
  }

  calibratePart3(){
      console.log('calibrate 3.');
      console.log(this.currentTest.noticed);

      //set up remainder of test
      this.currentTest.next = [];
      for (let i = this.currentTest.min; i <= this.currentTest.max; i++) {

        let push_length = 10;

        if (i in this.currentTest.noticed){
            push_length -= this.currentTest.noticed[i].length;
        }

        let push_array = new Array(push_length).fill(i);
        this.currentTest.next = this.currentTest.next.concat(push_array);
      }

      this.currentTest.next = this.currentTest.next.shuffle();

      this.currentTest.state = 's3';
      this.currentTest.current_level = this.currentTest.next.pop();
      this.sendVibrate(this.currentTest.current_level);
      this.timer = setTimeout(this.cal3notFelt.bind(this), 3000);
  }

  feltStimuli(){
      console.log('felt it');
      if (this.waitForBuzz){
        console.log('waiting after prev felt');
      } else {

        clearTimeout(this.timer);


        if (this.currentTest.state == 's1'){
            console.log('noticed at ' + this.currentTest.min);
            this.currentTest.state = 's2start';
            this.waitForBuzz = 1;
            this.currentTest.max = this.currentTest.min;
            this.currentTest.min -= 5;
            this.currentTest.noticed[this.currentTest.min] = [0];
            this.currentTest.noticed[this.currentTest.max] = [1];
            this.updateResults(this.currentTest.noticed);
            this.timer = setTimeout(this.calibratePart2.bind(this), 3000);

        } else if (this.currentTest.state == 's2min'){
            //we felt the minimum stimuli in part2 (oops, bump it down)
            this.noticedPushOrCreate(this.currentTest.current_level, 1);

            if (this.currentTest.current_level == this.currentTest.min){
                this.currentTest.min -= 1;
                this.currentTest.noticed[this.currentTest.min] = [];
            }

            this.nextCal2(1);

        } else if (this.currentTest.state == 's2max'){
            // we felt the maximum stimuli in part2 (good!)
            this.noticedPushOrCreate(this.currentTest.current_level, 1);
            this.nextCal2(1);

        } else if (this.currentTest.state == 's3'){
            console.log(this.currentTest.next);
            this.noticedPushOrCreate(this.currentTest.current_level, 1);

            if (this.currentTest.next.length){
                this.waitForBuzz = 1;
                this.currentTest.current_level = this.currentTest.next.pop();
                this.timer = setTimeout(this.nextBuzzCal3.bind(this), 3000);
            } else {
                this.doneTest();
            }

        }
      }
  }

  sendVibrate(intensity){
    this.props.sendVibrate(intensity);
  }

  sendVibrateSlider(){
    this.props.sendVibrate(this.state.sliderValue);
  }

  startTest(){
      console.log('START TEST');
      this.currentTest = {'min':30, 'max':100, 'state':'s1', 'noticed':{}, 'next':[]}
      this.setState({testRunning: true});
      this.timer = setTimeout(this.calibratePart1.bind(this), 3000);
  }

  stopTest(){
      clearTimeout(this.timer);
      console.log('TEST ABORTED');
      this.setState({testRunning: false});
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


        <View style={{width:'100%', height: 80, flexGrow:1, flex:1, flexDirection:'row', alignItems:'center'}}>
          <View style={{height:115, width:'100%'}}>

            <StatusView
                    pavlokStatus={this.props.pavlokStatus}
                    firebaseSignedIn={this.props.firebaseSignedIn}
                    username={this.props.username}
                    setUsername={this.props.setUsername}/>
            </View>
          </View>
          <View style={{height:45, width:'100%'}}>
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

        <View>
        {Object.keys(this.state.results).map((key, index) => {
                return (<Text style={{width:'100%', textAlign:'left'}} key={index}>{key}: {this.state.results[key]} %</Text>)
        })}
        </View>


      </ScrollView>
    )
  }
};

