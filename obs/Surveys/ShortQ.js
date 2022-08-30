//Surveys/ShortQ
//
// Survey for start of videogame.
// OnSubmitted returns array of question followed by answer
//
//

import React, { useEffect, useState, useRef } from "react";

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
  TextStyle,	
  Image,
} from "react-native";

import Slider from "@react-native-community/slider";

function ShortQ(props){

    return (
	<>
            <View style={{width:'90%', height:30, justifyContent:'center', alignItems:'center'}}>
		    <Text style={{width:'90%'}}>{props.text}: {props.map[props.val]}</Text>
            </View>

            <View style={{width:'100%', justifyContent:'center', alignItems:'center'}}>
            <Slider
            onValueChange={sliderValue => props.setter(parseInt(sliderValue))}
            minimumValue={1}
            maximumValue={Object.keys(props.map).length}
            step={1}
            value={props.val}
            style={{width:"80%", transform: [{ scaleY: 0.7 }]}}
            />
	    </View>
	</>
    );
}

const styles = StyleSheet.create({
  description: {
    marginBottom: 20,
    fontSize: 18,
    textAlign: "center",
    color: "#656565",
  },
  container: {
    marginTop: 5,
    marginBottom: 5,
    marginLeft: 10,
    marginRight: 10,
    flex:1,
    flexDirection:'row',
    height: 75,
    padding: 5,
    borderRadius:5,
    borderColor:'gray',
    borderWidth:0,
    justifyContent: 'center'
  },
});

export default ShortQ;
