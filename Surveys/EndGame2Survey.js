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

import DropDownPicker from 'react-native-dropdown-picker';
import TimeInput from '@tighten/react-native-time-input';
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

function EndGame2Survey(props){
    const [emotion, setEmotion] = useState(-1);	
    const [focus, setFocus] = useState(-1);	
    const [alertness, setAlertness] = useState(-1);	
    const [gameDropOpen, setGameDropOpen] = useState(false);
    const [gameDropChoice, setGameDropChoice] = useState(null);
    const [gameDropItems, setGameDropItems] = useState([
	{label:'GAME 1!!', value:'game1'},
	{label:'GAME 2!!', value:'game2'},
	{label:'GAME 3!!', value:'game3'},
	{label:'GAME 4!!', value:'game4'}
    ]);
    const [time, setTime] = useState('');
    const [timeValid, setTimeValid] = useState(false);

    const handleTimeChange = (time, validTime) => {
	    if (!validTime) return;
	    setTime(time);
	    setTimeValid(true);
    }

    const [dur, setDur] = useState(null);	
	
    const durBoundCheck = (duration) => {
	if (duration > 0 && duration < 241){
		return true;
	}
	return false;    
    }

    return (
	<>

	    <Text> End Game #2 Survey </Text>
	    <DropDownPicker open={gameDropOpen} value={gameDropChoice} items={gameDropItems} 
	    	setOpen={setGameDropOpen} setValue={setGameDropChoice} setItems={setGameDropItems}/>
	    
	    <ScrollView>
	    <TimeInput
		initialTime={0}
		onTimeChange={handleTimeChange}
	    />
    	    {timeValid?<Text>Current time entered is: {time}</Text>:<></>}
	    

	    <TextInput
	    keyboardType="number-pad"
      	    maxLength={3}
	    onChangeText={text => { if (durBoundCheck(parseInt(text))) {setDur(parseInt(text));}}}
	    placeholder="00"
	    value={dur}
	    style={{
		    borderRadius: 6,
		    borderStyle: 'solid',
		    borderWidth: 1.5,
		    fontSize: 14,
		    height: 40,
		    marginRight: 24,
		    padding: 10,
		    paddingRight: 34,
		    width: 90
	    }}
            />
    	    <Text>Duration entered is: {dur}</Text>

            <View style={{width:290, height:50, padding:5, justifyContent:'center', alignItems:'center'}}>
		    <Text style={{width:290}}>Focus: {optMap[focus]}</Text>
            </View>


            <Slider
            onValueChange={sliderValue => setFocus(parseInt(sliderValue))}
            minimumValue={1}
            maximumValue={5}
            step={1}
            value={focus}
            style={{width:"80%", marginHorizontal:"10%"}}
            />


            <View style={{width:290, height:50, padding:5, justifyContent:'center', alignItems:'center'}}>
		    <Text style={{width:290}}>Emotion: {emoMap[emotion]}</Text>
            </View>

            <Slider
            onValueChange={sliderValue => setEmotion(parseInt(sliderValue))}
            minimumValue={1}
            maximumValue={5}
            step={1}
            value={emotion}
            style={{width:"80%", marginHorizontal:"10%"}}
            />


            <View style={{width:"100%", padding:5, alignItems:'flex-start'}}>
		    <Text>A long question asking you about your alertness?</Text>
            </View>


	    <View style={{width:"100%", padding:5, flexDirection:'row', justifyContent:"flex-start", alignItems:'center'}}>
	    <View style={{width:"30%", flexDirection:'row', paddingRight:10, justifyContent:"flex-end"}}>
		    <Text>{optMap[alertness]}</Text>
	    </View>
            <Slider
            onValueChange={sliderValue => setAlertness(parseInt(sliderValue))}
            minimumValue={1}
            maximumValue={5}
            step={1}
            value={alertness}
            style={{width:"60%"}}
            />

	    </View>

            <View style={{width:"100%", padding:5,  alignItems:'flex-start'}}>
		    <Text>A long question asking you about your alertness?</Text>
            </View>


	    <View style={{width:"100%", padding:5, flexDirection:'row', justifyContent:"flex-start", alignItems:'center'}}>
	    <View style={{width:"30%", flexDirection:'row', paddingRight:10, justifyContent:"flex-end"}}>
		    <Text>{optMap[alertness]}</Text>
	    </View>
            <Slider
            onValueChange={sliderValue => setAlertness(parseInt(sliderValue))}
            minimumValue={1}
            maximumValue={5}
            step={1}
            value={alertness}
            style={{width:"60%"}}
            />

	    </View>


            <View style={{width:"100%", padding:5,  alignItems:'flex-start'}}>
		    <Text>A long question asking you about your alertness?</Text>
            </View>


	    <View style={{width:"100%", padding:5, flexDirection:'row', justifyContent:"flex-start", alignItems:'center'}}>
	    <View style={{width:"30%", flexDirection:'row', paddingRight:10, justifyContent:"flex-end"}}>
		    <Text>{optMap[alertness]}</Text>
	    </View>
            <Slider
            onValueChange={sliderValue => setAlertness(parseInt(sliderValue))}
            minimumValue={1}
            maximumValue={5}
            step={1}
            value={alertness}
            style={{width:"60%"}}
            />

	    </View>

            <View style={{width:"100%", padding:5,  alignItems:'flex-start'}}>
		    <Text>A long question asking you about your alertness?</Text>
            </View>


	    <View style={{width:"100%", padding:5, flexDirection:'row', justifyContent:"flex-start", alignItems:'center'}}>
	    <View style={{width:"30%", flexDirection:'row', paddingRight:10, justifyContent:"flex-end"}}>
		    <Text>{optMap[alertness]}</Text>
	    </View>
            <Slider
            onValueChange={sliderValue => setAlertness(parseInt(sliderValue))}
            minimumValue={1}
            maximumValue={5}
            step={1}
            value={alertness}
            style={{width:"60%"}}
            />

	    </View>

	    <View style={{...styles.separator, padding:20}} />

            <View style={{width:'100%', height:50, padding:5, justifyContent:'center', alignItems:'center'}}>
            <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => {props.onSubmitted(['focus', focus, 'emotion', emotion, 'alertness', alertness]);}}>
                <Text style={{width:'100%', padding:10, paddingTop:5, height: 30, borderColor: '#7a42f4', 
			      borderWidth: 1, textAlign:'center', alignItems:'center', justifyContent:'center'}}>
                    Submit
                </Text>
            </TouchableOpacity>
            </View>

	    </ScrollView>
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

export default EndGame2Survey;
