//Surveys/StartDay
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
    1: 'strongly disagree',
    2: 'disagree',
    3: 'neutral',
    4: 'agree',
    5: 'strongly agree'
};


function StartDaySurvey(props){

    const [reactionTimes, setReactionTimes] = useState([]);	
    const [empaticaTime, setEmpaticaTime] = useState("");	

    const [nowAlertness, setNowAlertness] = useState(-1);	
    const [nowStress, setNowStress] = useState(-1);	
    const [nowEmotion, setNowEmotion] = useState(-1);	
    const [nowEmoIntensity, setNowEmoIntensity] = useState(-1);	

    const [tired, setTired] = useState(-1);
    const [stressed, setStressed] = useState(-1);
    const [focused, setFocused] = useState(-1);
    const [effortless, setEffortless] = useState(-1);
    const [productive, setProductive] = useState(-1);
    const [emotional, setEmotional] = useState(-1);
    const [distracted, setDistracted] = useState(-1);
    const [engagedPleasure, setEngagedPleasure] = useState(-1);
    const [engagedFulfilling, setEngagedFulfilling] = useState(-1);
    const [challenged, setChallenged] = useState(-1);
    const [competent, setCompetent] = useState(-1);

    const [freeEmotion, setFreeEmotion] = useState('');	
    const [freeFood, setFreeFood] = useState('');	
    const [freeAdditional, setFreeAdditional] = useState('');	

    const [doneTime, setDoneTime] = useState(false);	

    return (
	<>
	    <View style={{width:"100%", flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
		    <Text style={{fontWeight:'bold', padding:15}}> Start Day Survey </Text>
	    </View>

	    <ScrollView keyboardShouldPersistTaps='handled'>

	    {!doneTime && <>

	    <EmpaticaCue start={true} setter={setEmpaticaTime}/>

	    <Text style={{paddingBottom:30, paddingTop:60}}> 
		1. Please only participate today if it's a 'regular day' for you (you're working, no unusual stressors or major commitements).
		    {"\n\n"} 
		2. Please place the watch on your dominant wrist and the glasses on after turning them on. (Button pressed toward the back on glasses, causing quick flashing lights.) 
		    {"\n\n"}  If these are true, hit this button:</Text>


	    <Button title="Today is a typical workday for me and I am wearing three wearables." onPress={() => setDoneTime(true)}/>
	    </>}	



	    {doneTime && <>

	    <Text style={{paddingTop:10, paddingBottom:10, fontWeight:'bold'}}> How do you feel now? </Text>
	    <ShortQ map={lowMap} text="Alertness" val={nowAlertness} setter={setNowAlertness}/>
	    <ShortQ map={lowMap} text="Stress" val={nowStress} setter={setNowStress}/>
	    <ShortQ map={negMap} text="Emotional State" val={nowEmotion} setter={setNowEmotion}/>
	    <ShortQ map={lowMap} text="Emotional Intensity" val={nowEmoIntensity} setter={setNowEmoIntensity}/>

	    <Text style={{paddingTop:10, paddingBottom:10, fontWeight:'bold'}}>  Today you're expecting to feel ___. </Text>
	    <ShortQ map={disagreeMap} text="Tired/Groggy" val={tired} setter={setTired}/>
	    <ShortQ map={disagreeMap} text="Stressed" val={stressed} setter={setStressed}/>
	    <ShortQ map={disagreeMap} text="Focused" val={focused} setter={setFocused}/>
	    <ShortQ map={disagreeMap} text="Effortlessly Engaged" val={effortless} setter={setEffortless}/>
	    <ShortQ map={disagreeMap} text="Productive" val={productive} setter={setProductive}/>
	    <ShortQ map={disagreeMap} text="Emotional" val={emotional} setter={setEmotional}/>
	    <ShortQ map={disagreeMap} text="Distracted" val={distracted} setter={setDistracted}/>
	    <ShortQ map={disagreeMap} text="Engaged in Pleasurable Tasks" val={engagedPleasure} setter={setEngagedPleasure}/>
	    <ShortQ map={disagreeMap} text="Engaged in Fulfilling Tasks" val={engagedFulfilling} setter={setEngagedFulfilling}/>
	    <ShortQ map={disagreeMap} text="Challenged" val={challenged} setter={setChallenged}/>
	    <ShortQ map={disagreeMap} text="Competent" val={competent} setter={setCompetent}/>

	    <FreeQ text="Describe your emotional and focus state:" val={freeEmotion} setter={setFreeEmotion}/>
	    <FreeQ text="Have you done any exercise or had any caffeine today?  What other food, drinks?" val={freeFood} setter={setFreeFood}/>
	    <FreeQ text="Anything else you think is relevant for us to know?" val={freeAdditional} setter={setFreeAdditional}/>

            <ReactionTime trials={13} val={reactionTimes} setter={setReactionTimes}/>			    

	    <View style={{...styles.separator, padding:20}} />

            <View style={{width:'100%', height:50, padding:5, justifyContent:'center', alignItems:'center'}}>
            <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => {props.onSubmitted([
			'nowAlertness', nowAlertness,
			'nowStress', nowStress,
			'nowEmotion', nowEmotion,
			'nowEmoIntensity', nowEmoIntensity,
			'tired', tired,
			'stressed', stressed,
			'focused', focused,
			'effortless', effortless,
			'productive', productive,
			'emotional', emotional,
			'distracted', distracted,
			'engagedPleasure', engagedPleasure,
			'engagedFulfilling', engagedFulfilling,
			'challenged', challenged,
			'competent', competent,
			'freeEmotion', freeEmotion,
			'freeFood', freeFood,
			'freeAdditional', freeAdditional,
		    	'reactionTimesMs', String(reactionTimes),
			'empaticaStartTime', empaticaTime
		    ], false);}}>
                <Text style={{width:'100%', padding:10, paddingTop:5, height: 30, borderColor: '#7a42f4', 
			      borderWidth: 1, textAlign:'center', alignItems:'center', justifyContent:'center'}}>
                    Submit
                </Text>
            </TouchableOpacity>
            </View>

            </>}

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

export default StartDaySurvey;
