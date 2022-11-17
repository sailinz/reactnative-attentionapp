import React, { Component } from 'react';
import { WebView } from 'react-native-webview';

import {decode as atob, encode as btoa} from 'base-64'
import styles from "./Styles";

import StatusView from "./StatusView.js";
import Slider from "@react-native-community/slider";

// import { CheckBox } from 'react-native-elements'
import CheckBox from '@react-native-community/checkbox';
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

// const htmlPath = require('flowIOjs/index.html');

// export default class FlowIOControl extends React.Component {
//   render() {
//     return <WebView source={{ uri: htmlPath, baseUrl: baseUrl }} />;
//   }
// }


const STOP = 0x21;
const INFLATION = 0x2b;
const VACUUM = 0x2d;
const RELEASE = 0x5e;
const INFLATION_HALF = 0x70;
const VACUUM_HALF = 0x6e;
//------------
const ALLPORTS = 0xff;
const MAXPWM = 0xff;
//-----------------------------------------------------
let byte0 = 0;
const PORT1 = (byte0>>0 & 0x01);
const PORT2 = (byte0>>1 & 0x01);
const PORT3 = (byte0>>2 & 0x01);
const PORT4 = (byte0>>3 & 0x01);
const PORT5 = (byte0>>4 & 0x01);


 
export default class FlowIOControl extends React.Component {
  constructor(props) {
    super(props);
    this.state = {port1Check: false, inflateCheck:false};
  }


  toggleTest(){
    this.state.inflateCheck = !this.state.inflateCheck;
    commandArray = new Uint8Array([INFLATION,PORT1]); //Always holds the last command written. what,where,how
    // commandArray = new Uint8Array([INFLATION,PORT1,MAXPWM]); //Always holds the last command written. what,where,how
    this.props.sendPort1Update(commandArray);
  }


  
  render() {
    return (
      <ScrollView>
        <View style={styles.viewContainer}>
          <View style={{height:115, width:'100%'}}>
          <StatusView
              glassesStatus={this.props.glassesStatus}
              flowIOStatus={this.props.flowIOStatus}
              username={this.props.username}
              setUsername={this.props.setUsername}/>
          </View>

          {/* <View style={styles.checkboxWrapper}>
              <CheckBox
                  value={this.state.port1Check}
                  onValueChange={() => this.setState({port1Check: !this.state.port1Check})}
              />
              <Text>Port 1</Text>
          </View> */}
{/* 
          <View style={styles.checkboxWrapper}>
              <CheckBox
                  value={this.state.inflateCheck}
                  onValueChange={() => this.setState({inflateCheck: !this.state.inflateCheck})}
              />
              <Text>Inflate</Text>
          </View> */}
          <View style={styles.checkboxWrapper}>
              <CheckBox
                  value={this.state.inflateCheck}
                  onValueChange={() => this.toggleTest()}
                  // onValueChange={() => this.setState({
                  //   inflateCheck: !this.state.inflateCheck
                  // })}
              />
              <Text>Inflate port1</Text>
          </View>
              
        </View>
      </ScrollView>
    )
  }
};
 
 