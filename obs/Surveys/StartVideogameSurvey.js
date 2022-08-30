//Surveys/StartVideogame
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

import DropDownPicker from 'react-native-dropdown-picker';
import TimeInput from '@tighten/react-native-time-input';
import Slider from "@react-native-community/slider";
import ReactionTime from '../Surveys/ReactionTime';
import EmpaticaCue from '../Surveys/EmpaticaCue';

const confidenceMap = {
    1: 'very rough',
    2: 'rough (within 15 min)',
    3: 'close (within 5 min)',
    4: 'very close (within 3 min)',
    5: 'precise minute'
};

const flowMap = {
    1: 'intensely slow',
    2: 'slow',
    3: 'no',
    4: 'fast',
    5: 'intensely fast'
};

const durationMap = {
    1: 'none',
    2: 'a little',
    3: 'a lot'
};

const lowMap = {
    1: 'very low',
    2: 'low',
    3: 'average',
    4: 'high',
    5: 'very high'
};

const negMap = {
    1: 'very negative',
    2: 'negative',
    3: 'nuetral',
    4: 'positive',
    5: 'very positive'
};

const disagreeMap = {
    1: 'very negative',
    2: 'negative',
    3: 'nuetral',
    4: 'positive',
    5: 'very positive'
};

function StartVideogameSurvey(props){
    const [reactionTimes, setReactionTimes] = useState([]);	
    const [empaticaTime, setEmpaticaTime] = useState("");	

    const [gameDropOpen, setGameDropOpen] = useState(false);
    const [gameDropChoice, setGameDropChoice] = useState(null);
    const [gameDropItems, setGameDropItems] = useState([
	{label:'GAME 1!!', value:'game1'},
	{label:'GAME 2!!', value:'game2'},
	{label:'GAME 3!!', value:'game3'},
	{label:'GAME 4!!', value:'game4'}
    ]);

    const [dt, setDt] = useState(new Date().toLocaleString());

    useEffect(() => {
	    let secTimer = setInterval( () => {
	      setDt(new Date().toLocaleString())
	    },1000)

	    return () => clearInterval(secTimer);
    }, []);	

    return (
	<>

	    <View style={{width:"100%", flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
		    <Text style={{fontWeight:'bold', padding:15}}> Start Game Survey </Text>
	    </View>

	    <ScrollView keyboardShouldPersistTaps='handled'>

	    <EmpaticaCue start={true} setter={setEmpaticaTime}/>

	    <Text style={{paddingBottom:30, paddingTop:30}}> You are about to start your game!  Please select the game you indicated you would play every day from the drop-down below: </Text>

	    <DropDownPicker open={gameDropOpen} value={gameDropChoice} items={gameDropItems} 
	    	setOpen={setGameDropOpen} setValue={setGameDropChoice} setItems={setGameDropItems}/>
	    
            <ReactionTime trials={13} val={reactionTimes} setter={setReactionTimes}/>			    

	    <Text style={{paddingBottom:30, paddingTop:30}}> The time is now:</Text>

	    <View style={{width:"100%", flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
		    <Text style={{fontWeight:'bold', padding:15}}> {dt} </Text>
	    </View>

	    <Text style={{paddingBottom:10, paddingTop:30}}>Make sure you have your wearables on and the game pulled up on your iPad. When you notice the peripheral light in your vision has turned from blue to green, indicate it by hitting the button in the app.  Please silence potential interruptions and hide any clocks from view; please make sure you have 2 hours available so you're not stressed.   When you're ready, hit start below and start playing!  </Text>




	    <View style={{...styles.separator, padding:20}} />

            <View style={{width:'100%', height:50, padding:5, justifyContent:'center', alignItems:'center'}}>
            <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => {props.onSubmitted(['reactionTimesMs', String(reactionTimes), 'LastSeenTimeStartVideogameSurvey', dt, 'empaticaStartTime', empaticaTime, 'Game1', gameDropChoice]);}}>
                <Text style={{width:'100%', padding:10, paddingTop:5, height: 30, borderColor: '#7a42f4', 
			      borderWidth: 1, textAlign:'center', alignItems:'center', justifyContent:'center'}}>
                    Start!
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

export default StartVideogameSurvey;
