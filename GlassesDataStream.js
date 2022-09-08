/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */


import {decode as atob, encode as btoa} from 'base-64'

import React, {forwardRef} from "react";
import styles from "./Styles";

import StatusView from "./StatusView.js";

import { Chart, SetData } from "@dpwiese/react-native-canvas-charts/ChartJs";
import {LineChart} from "react-native-chart-kit";
import { Dimensions } from 'react-native';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';

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


function arrayToXY(data){

	let returnList = [];    
	data.forEach((v, i) => {
		   returnList.push({x:i,y:v});	
	//   returnList.push([i,v]);	
	});

	return [returnList];

}


function arrayValsToXYs(data){

	let returnList = [];

	for (let i=0; i<data[0].length; i++){
		returnList.push([]);
	}

	data.forEach((v, i) => {
		v.forEach((v2, i2) => {
		   returnList[i2].push({x:i,y:v2});	
		});
	});

	return returnList;

}


export default class GlassesDataStream extends React.Component {
  constructor(props) {
    super(props);
    this.state = {intensity: 170, startBlue: 70, bIntensity: 50, notes: '', transitioning: false,
                  mainInterval: 1, stepInterval: 100, testRunning: false, results:[1,2,3,4,3,2,1,5,5,5,5]};
    this.timer = null;
    this.transitioning = false;	  

                    // 0, 0, 0, 0,lB,lG, 0, 0,lR, 0, 0, 0, 0,rB,rG, 0, 0,rR]
    this.lightState = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    this.rg_toggle = true;
    this.setGlassesBlinkDataRef = React.createRef<SetData>();
    this.setGlassesThermalDataRef = React.createRef<SetData>();
    this.setGlassesAccDataRef = React.createRef<SetData>();
    this.setGlassesGyroDataRef = React.createRef<SetData>();
  }

  componentDidUpdate(prevProps){
	if (this.props.glassesBlinkData != prevProps.glassesBlinkData){
		this.setGlassesBlinkDataRef.current.setData(arrayToXY(this.props.glassesBlinkData));
	}
	if (this.props.glassesThermalData != prevProps.glassesThermalData){
		this.setGlassesThermalDataRef.current.setData(arrayValsToXYs(this.props.glassesThermalData));
	}
	if (this.props.glassesAccData != prevProps.glassesAccData){
		this.setGlassesAccDataRef.current.setData(arrayValsToXYs(this.props.glassesAccData));
	}
	if (this.props.glassesGyroData != prevProps.glassesGyroData){
		this.setGlassesGyroDataRef.current.setData(arrayValsToXYs(this.props.glassesGyroData));
	}
        if (this.props.glassesStatus !== prevProps.glassesStatus) {
		//if we're not scanning and haven't connected to glasses, scan	  
		if(!this.props.scanning && this.props.glassesStatus != 'Connected.'){
			console.log('dataview: we are not scanning but we should be now');
			this.props.setScanning(true);
		}

		//if we're scanning but have connected to glasses, stop scan	  
		if(this.props.scanning && this.props.glassesStatus == 'Connected.'){
			console.log('dataview: we are scanning but we now don\'t need to');
			this.props.setScanning(false);
	}
    }
  }
  componentDidMount(){
	console.log('start dataview stream');  
	this.props.setStreamDataUI(true);  
  }

  componentWillUnmount(){
	console.log('kill dataview stream');  
	this.props.setStreamDataUI(false);  
  }

  componentDidUpdate = (nextProps) => {
    //on change of glassesStatus...	  
    if (nextProps.glassesStatus !== this.props.glassesStatus) {
	console.log('Got status update');

	//if we're not scanning and haven't connected to glasses, scan	  
	if(!this.props.scanning && this.props.glassesStatus != 'Connected.'){
		console.log('dataview: we are not scanning but we should be now');
		this.props.setScanning(true);
	}

	//if we're scanning but have connected to glasses, stop scan	  
	if(this.props.scanning && this.props.glassesStatus == 'Connected.'){
		console.log('dataview: we are scanning but we now don\'t need to');
		this.props.setScanning(false);
	}
    }
  }	


  setLightWhite(){
    let i = this.state.intensity;
    let b = this.state.startBlue;
    //this.lightState = [0,0,0,0,i,i,0,0,i,0,0,0,0,i,i,0,0,i];
    this.lightState =   [0,0,0,0,b,i,0,0,0,0,0,0,0,b,i,0,0,0];

    this.props.sendLEDUpdate(this.lightState);
    console.log('sent reset light');	  
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
        console.log('ALREADY BLUE; FINISHED TRANSITION');
	this.setState({transitioning: false});
	this.transitioning = false;    
    }
  }


  changeColor(){

      if (!this.transitioning && this.state.startBlue == this.lightState[4]){
	  this.setState({transitioning: true});
	  this.transitioning = true;    
      }
      if (this.transitioning){
        this.moveToBlue();
        this.timer = setTimeout(this.changeColor.bind(this), this.state.stepInterval);
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

  getStepInterval(){
    let secs = 15;
    secs += Math.random() * 40;
    return Math.round(secs*1000);
  }


  render() {
    return (
      <ScrollView>
	<NavCallbackComponent {...this.props}/>   

        <View style={styles.viewContainer}>
          <View style={{height:115, width:'100%'}}>

          <StatusView
                glassesStatus={this.props.glassesStatus}
                firebaseSignedIn={this.props.firebaseSignedIn}
                username={this.props.username}
                setUsername={this.props.setUsername}
	        pic={this.props.scanning?"scanning":"bluetooth"} 
	        connect={this.props.connect}/>
        </View>

	    {/*    
        <View style={{width:'100%', height:100, flexGrow:1, flex:1, flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
	<View style={{width:'50%'}}>
        <TouchableOpacity
          style={styles.bigbuttonStyleLarge}
          activeOpacity={0.5}
          onPress={() => this.props.setStreamDataUI(prevUI => !prevUI)}>
            {this.props.streamDataUI ?
                <Image source={require('./icons/file_progress.png')}
                    style={{width:'100%', height: undefined, aspectRatio:1}}/>:
                <Image source={require('./icons/file_stopped.png')}
                    style={{width:'100%', height: undefined, aspectRatio:1}}/>}
        </TouchableOpacity>
	</View>
        <View style={{flexDirection:'column'}}>
	{Object.entries(this.props.packetCount).map(([key, value]) => (
		<Text key={key}>{key}:{value}</Text>
        ))}
	</View>    
	</View>    
	*/}

	{this.props.glassesBlinkData.length?
	    <>

          <View style={{height:185, width:'100%'}}>
		<Chart config={chartConfigCanvas} ref={this.setGlassesBlinkDataRef} style={{height: '100%', width: '100%'}}/>
	  </View>
          <View style={{height:185, width:'100%'}}>
		<Chart config={thermalChartConfigCanvas} ref={this.setGlassesThermalDataRef} style={{height: '100%', width: '100%'}}/>
	  </View>
          <View style={{height:185, width:'100%'}}>
		<Chart config={accChartConfigCanvas} ref={this.setGlassesAccDataRef} style={{height: '100%', width: '100%'}}/>
	  </View>
          <View style={{height:185, width:'100%'}}>
		<Chart config={gyroChartConfigCanvas} ref={this.setGlassesGyroDataRef} style={{height: '100%', width: '100%'}}/>
	  </View>


            </>
            :<Text> no data yet </Text>}
        <View style={{margin:5}} />
        <View style={styles.separator} />


        </View>

        <Button
	  title = {this.state.transitioning ? "Transitioning..":"Start Transition"}
          style={styles.smallButtonStyle}
          onPress={() => this.changeColor()}>
        </Button>
        <Button
	  title="Reset Light" 
          style={styles.smallButtonStyle}
          onPress={() => this.setLightWhite()}>
        </Button>

	
      </ScrollView>
    )
  }
};


function NavCallbackComponent(props){

    useFocusEffect(
	    React.useCallback(() => {
		console.log('CALLED WORKSESSION FOCUS');

		if (!props.scanning && props.glassesStatus != 'Connected.'){
			console.log('glasses not connected and not scanning; start');
			props.setScanning(true);
		}

		if (props.scanning && props.glassesStatus == 'Connected.'){
			  console.log('scanning but glasses connected; stop');
			  props.setScanning(false);
		}

	    }, [])
    );

    return null;
}


const chartConfigCanvas = {
  type: "line",
  data: {
    datasets: [
      {
        label: "Blink Val",
        backgroundColor: "rgb(224, 110, 60)",
        borderColor: "rgb(224, 110, 60)",
        data: [
          { x: 1, y: 10 },
          { x: 2, y: 5 },
          { x: 3, y: 0 },
        ],
        fill: false,
        pointRadius: 0,
        lineTension: 0.1,
        borderJoinStyle: "round",
      },
    ],
  },
  options: {
    animation: {
      duration: 0,
    },
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Blink Data",
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
      legend: {
        display: false
      }
    },
    hover: {
      mode: "nearest",
      intersect: true,
    },
    scales: {
      x: {
        type: "linear",
        display: true,
        scaleLabel: {
          display: false,
          labelString: "My X-Axis Label",
        },
        ticks: {
          autoSkipPadding: 100,
          autoSkip: true,
          minRotation: 0,
          maxRotation: 0,
        },
      },
      y: {
        display: true,
        scaleLabel: {
          display: false,
          labelString: "My Y-Axis Label",
        },
      },
    },
  },
};

const thermalChartConfigCanvas = {
  type: "line",
  data: {
    datasets: [
      {
        label: "Temple",
        backgroundColor: "rgb(224, 110, 60)",
        borderColor: "rgb(224, 110, 60)",
        data: [
          { x: 1, y: 0 },
          { x: 2, y: 0 },
          { x: 3, y: 0 },
	],
        fill: false,
        pointRadius: 0,
        lineTension: 0.1,
        borderJoinStyle: "round",
      },
      {
        label: "Nose",
        backgroundColor: "rgb(0, 110, 60)",
        borderColor: "rgb(0, 110, 60)",
        data: [
          { x: 1, y: 3 },
          { x: 2, y: 3 },
          { x: 3, y: 3 },
	],
        fill: false,
        pointRadius: 0,
        lineTension: 0.1,
        borderJoinStyle: "round",
      },

    ],
  },
  options: {
    animation: {
      duration: 0,
    },
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Thermal Data",
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
      legend: {
        display: false
      }
    },
    hover: {
      mode: "nearest",
      intersect: true,
    },
    scales: {
      x: {
        type: "linear",
        display: true,
        scaleLabel: {
          display: false,
          labelString: "My X-Axis Label",
        },
        ticks: {
          autoSkipPadding: 100,
          autoSkip: true,
          minRotation: 0,
          maxRotation: 0,
        },
      },
      y: {
        display: true,
        scaleLabel: {
          display: false,
          labelString: "My Y-Axis Label",
        },
      },
    },
  },
};

const accChartConfigCanvas = {
  type: "line",
  data: {
    datasets: [
      {
        label: "X",
        backgroundColor: "rgb(224, 110, 60)",
        borderColor: "rgb(224, 110, 60)",
        data: [
          { x: 1, y: 0 },
          { x: 2, y: 0 },
          { x: 3, y: 0 },
	],
        fill: false,
        pointRadius: 0,
        lineTension: 0.1,
        borderJoinStyle: "round",
      },
      {
        label: "Y",
        backgroundColor: "rgb(0, 110, 60)",
        borderColor: "rgb(0, 110, 60)",
        data: [
          { x: 1, y: 3 },
          { x: 2, y: 3 },
          { x: 3, y: 3 },
	],
        fill: false,
        pointRadius: 0,
        lineTension: 0.1,
        borderJoinStyle: "round",
      },
      {
        label: "Z",
        backgroundColor: "rgb(100, 0, 160)",
        borderColor: "rgb(100, 0, 160)",
        data: [
          { x: 1, y: 3 },
          { x: 2, y: 3 },
          { x: 3, y: 3 },
	],
        fill: false,
        pointRadius: 0,
        lineTension: 0.1,
        borderJoinStyle: "round",
      },

    ],
  },
  options: {
    animation: {
      duration: 0,
    },
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Acc Data",
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
      legend: {
        display: false
      }
    },
    hover: {
      mode: "nearest",
      intersect: true,
    },
    scales: {
      x: {
        type: "linear",
        display: true,
        scaleLabel: {
          display: false,
          labelString: "My X-Axis Label",
        },
        ticks: {
          autoSkipPadding: 100,
          autoSkip: true,
          minRotation: 0,
          maxRotation: 0,
        },
      },
      y: {
        display: true,
        scaleLabel: {
          display: false,
          labelString: "My Y-Axis Label",
        },
      },
    },
  },
};

const gyroChartConfigCanvas = {
  type: "line",
  data: {
    datasets: [
      {
        label: "X",
        backgroundColor: "rgb(224, 110, 60)",
        borderColor: "rgb(224, 110, 60)",
        data: [
          { x: 1, y: 0 },
          { x: 2, y: 0 },
          { x: 3, y: 0 },
	],
        fill: false,
        pointRadius: 0,
        lineTension: 0.1,
        borderJoinStyle: "round",
      },
      {
        label: "Y",
        backgroundColor: "rgb(0, 110, 60)",
        borderColor: "rgb(0, 110, 60)",
        data: [
          { x: 1, y: 3 },
          { x: 2, y: 3 },
          { x: 3, y: 3 },
	],
        fill: false,
        pointRadius: 0,
        lineTension: 0.1,
        borderJoinStyle: "round",
      },
      {
        label: "Z",
        backgroundColor: "rgb(100, 0, 160)",
        borderColor: "rgb(100, 0, 160)",
        data: [
          { x: 1, y: 3 },
          { x: 2, y: 3 },
          { x: 3, y: 3 },
	],
        fill: false,
        pointRadius: 0,
        lineTension: 0.1,
        borderJoinStyle: "round",
      },

    ],
  },
  options: {
    animation: {
      duration: 0,
    },
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Gyro Data",
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
      legend: {
        display: false
      }
    },
    hover: {
      mode: "nearest",
      intersect: true,
    },
    scales: {
      x: {
        type: "linear",
        display: true,
        scaleLabel: {
          display: false,
          labelString: "My X-Axis Label",
        },
        ticks: {
          autoSkipPadding: 100,
          autoSkip: true,
          minRotation: 0,
          maxRotation: 0,
        },
      },
      y: {
        display: true,
        scaleLabel: {
          display: false,
          labelString: "My Y-Axis Label",
        },
      },
    },
  },
};
