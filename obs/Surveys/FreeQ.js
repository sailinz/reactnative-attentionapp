//Surveys/FreeQ
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

function FreeQ(props){

    return (
	<>
	    {props.text && <View style={{width:"100%", padding:5, alignItems:'flex-start'}}>
		    <Text>{props.text}</Text>
            </View>}

	    <View style={{width:"100%", padding:5, flexDirection:'row', justifyContent:"flex-start", alignItems:'center'}}>
            <TextInput
		style={{width:"100%", height: 60, borderWidth:1}}
	        multiline
		placeholder="Enter Answer Here."
		onChangeText={newText => props.setter(newText)}
		defaultValue={props.val}
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

export default FreeQ;
