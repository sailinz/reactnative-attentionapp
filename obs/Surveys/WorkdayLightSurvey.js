//Surveys/WorkdayLight
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

import LongQ from '../Surveys/LongQ';
import ShortQ from '../Surveys/ShortQ';
import FreeQ from '../Surveys/FreeQ';
import ReactionTime from '../Surveys/ReactionTime';

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
    1: 'strongly disagree',
    2: 'disagree',
    3: 'neutral',
    4: 'agree',
    5: 'strongly agree'
};

const coffeeMap = {
    1: 'none',
    2: 'less than 1/2 a coffee/tea/soda',
    3: 'about 1 coffee/tea/soda',
    4: 'more than 1 coffe/tea/soda (or 1 energy drink)',
    5: '>= 2 coffee equivalents'	
};

function WorkdayLightSurvey(props){
    const [reactionTimes, setReactionTimes] = useState([]);	

    const [focusHour, setFocusHour] = useState(-1);	
    const [focusEffort, setFocusEffort] = useState(-1);	
    const [focusFlow, setFocusFlow] = useState(-1);	
    const [focusDuration, setFocusDuration] = useState(-1);	

    const [nowAlertness, setNowAlertness] = useState(-1);	
    const [nowStress, setNowStress] = useState(-1);	
    const [nowEmotion, setNowEmotion] = useState(-1);	
    const [nowEmoIntensity, setNowEmoIntensity] = useState(-1);	

    const [caffeineLevel, setCaffeineLevel] = useState(-1);	

    return (
	<>

	    <View style={{width:"100%", flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
		    <Text style={{fontWeight:'bold', padding:15}}> Workday Light Survey </Text>
	    </View>
	     
	    <ScrollView keyboardShouldPersistTaps='handled'>

            <ReactionTime trials={13} val={reactionTimes} setter={setReactionTimes}/>			    

	    <Text style={{paddingTop:10, paddingBottom:10, fontWeight:'bold'}}> Over the last hour or two, rate your: </Text>
	    <ShortQ map={lowMap} text="Level of Focus" val={focusHour} setter={setFocusHour}/>
	    <ShortQ map={lowMap} text="Effort Required to Focus" val={focusEffort} setter={setFocusEffort}/>
	    <ShortQ map={lowMap} text="Experienced Flow" val={focusFlow} setter={setFocusFlow}/>
	    <ShortQ map={durationMap} text="Duration of Flow" val={focusDuration} setter={setFocusDuration}/>
	    <ShortQ map={coffeeMap} text="Caffenation" val={caffeineLevel} setter={setCaffeineLevel}/>


	    <Text style={{paddingTop:10, paddingBottom:10, fontWeight:'bold'}}> How do you feel now? </Text>
	    <ShortQ map={lowMap} text="Alertness" val={nowAlertness} setter={setNowAlertness}/>
	    <ShortQ map={lowMap} text="Stress" val={nowStress} setter={setNowStress}/>
	    <ShortQ map={negMap} text="Emotional State" val={nowEmotion} setter={setNowEmotion}/>
	    <ShortQ map={lowMap} text="Emotional Intensity" val={nowEmoIntensity} setter={setNowEmoIntensity}/>

	    <View style={{...styles.separator, padding:20}} />

            <View style={{width:'100%', height:50, padding:5, justifyContent:'center', alignItems:'center'}}>
            <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => {props.onSubmitted([
			'focusHour', focusHour,
			'focusEffort', focusEffort,
			'focusFlow', focusFlow,
			'focusDuration', focusDuration,
			'nowAlertness', nowAlertness,
			'nowStress', nowStress,
			'nowEmotion', nowEmotion,
			'nowEmoIntensity', nowEmoIntensity,
		    	'caffeineLevel', caffeineLevel,
		    	'reactionTimesMs', String(reactionTimes)
		    ], false);}}>
                <Text style={{width:'100%', padding:10, paddingTop:5, height: 30, borderColor: '#7a42f4', 
			      borderWidth: 1, textAlign:'center', alignItems:'center', justifyContent:'center'}}>
                    Submit
                </Text>
            </TouchableOpacity>
            </View>

	    <View style={{...styles.separator, padding:20}} />

            <View style={{width:'100%', height:50, padding:5, justifyContent:'center', alignItems:'center'}}>
            <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => {props.onSubmitted([
			'focusHour', focusHour,
			'focusEffort', focusEffort,
			'focusFlow', focusFlow,
			'focusDuration', focusDuration,
			'nowAlertness', nowAlertness,
			'nowStress', nowStress,
			'nowEmotion', nowEmotion,
			'nowEmoIntensity', nowEmoIntensity,
		    	'caffeineLevel', caffeineLevel,
		    	'reactionTimesMs', String(reactionTimes)
		    ], true);}}>
                <Text style={{width:'100%', padding:10, paddingTop:5, height: 30, borderColor: '#7a42f4', 
			      borderWidth: 1, textAlign:'center', alignItems:'center', justifyContent:'center'}}>
                    Submit and End Session
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

export default WorkdayLightSurvey;
