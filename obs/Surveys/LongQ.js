//Surveys/LongQ
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

function LongQ(props){

    return (
	<>
	    {props.text && <View style={{width:"100%", padding:5, alignItems:'flex-start'}}>
		    <Text>{props.text}</Text>
            </View>}


	    <View style={{width:"100%", padding:5, flexDirection:'row', justifyContent:"flex-start", alignItems:'center'}}>
		    <View style={{width:"30%", flexDirection:'row', paddingRight:10, justifyContent:"flex-end"}}>
			    <Text>{props.map[props.val]}</Text>
		    </View>
		    <Slider
		    onValueChange={sliderValue => props.setter(parseInt(sliderValue))}
		    minimumValue={1}
		    maximumValue={Object.keys(props.map).length}
		    step={1}
		    value={props.val}
		    style={{width:"60%",transform: [{ scaleY: 0.7 }]}}
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

export default LongQ;
