//Surveys/EndWorkdaySurvey
//
// Survey for end of workday
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

function EndWorkdaySurvey(props){
    const [empaticaTime, setEmpaticaTime] = useState("");	

    const [focusHour, setFocusHour] = useState(-1);	
    const [focusEffort, setFocusEffort] = useState(-1);	
    const [focusFlow, setFocusFlow] = useState(-1);	
    const [focusDuration, setFocusDuration] = useState(-1);	

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
    const [freeFlow, setFreeFlow] = useState('');	
    const [freeActivities, setFreeActivities] = useState('');	
    const [freeFood, setFreeFood] = useState('');	
    const [freeEmails, setFreeEmails] = useState('');	
    const [freeWearables, setFreeWearables] = useState('');	
    const [freeAdditional, setFreeAdditional] = useState('');	

    const [fssA, setFssA] = useState(-1);	
    const [fssB, setFssB] = useState(-1);	
    const [fssC, setFssC] = useState(-1);	
    const [fssD, setFssD] = useState(-1);	
    const [fssE, setFssE] = useState(-1);	
    const [fssF, setFssF] = useState(-1);	
    const [fssG, setFssG] = useState(-1);	
    const [fssH, setFssH] = useState(-1);	
    const [fssI, setFssI] = useState(-1);	
    const [fssJ, setFssJ] = useState(-1);	
    
    const [bitA, setBitA] = useState(-1);	
    const [bitB, setBitB] = useState(-1);	
    const [bitC, setBitC] = useState(-1);	
    const [bitD, setBitD] = useState(-1);	
    const [bitE, setBitE] = useState(-1);	
    const [bitF, setBitF] = useState(-1);	
    const [bitG, setBitG] = useState(-1);	
    const [bitH, setBitH] = useState(-1);	
    const [bitI, setBitI] = useState(-1);	
    const [bitJ, setBitJ] = useState(-1);	

    const [doneTime, setDoneTime] = useState(false);	

    return (
	<>
	    <View style={{width:"100%", flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
		    <Text style={{fontWeight:'bold', padding:15}}> End Workday Survey </Text>
	    </View>

	    <ScrollView keyboardShouldPersistTaps='handled'>

	    {!doneTime && <>
	    <Text style={{paddingBottom:30, paddingTop:60}}> Step 1.  Please interact with your watch and guess the time! When done, hit this button:</Text>

	    <Button title="I guessed the time on my watch" onPress={() => setDoneTime(true)}/>
	    </>}	



	    {doneTime && <>

	    <Text style={{paddingBottom:30, paddingTop:60}}> If you just submitted a survey you can skip the first two sections (questions you just answered).</Text>

	    <Text style={{paddingTop:10, paddingBottom:10, fontWeight:'bold'}}> Over the last hour, rate your:</Text>
	    <ShortQ map={lowMap} text="Level of Focus" val={focusHour} setter={setFocusHour}/>
	    <ShortQ map={lowMap} text="Effort Required to Focus" val={focusEffort} setter={setFocusEffort}/>
	    <ShortQ map={lowMap} text="Experienced Flow" val={focusFlow} setter={setFocusFlow}/>
	    <ShortQ map={durationMap} text="Duration of Flow" val={focusDuration} setter={setFocusDuration}/>


	    <Text style={{paddingTop:10, paddingBottom:10, fontWeight:'bold'}}> How do you feel now? </Text>
	    <ShortQ map={lowMap} text="Alertness" val={nowAlertness} setter={setNowAlertness}/>
	    <ShortQ map={lowMap} text="Stress" val={nowStress} setter={setNowStress}/>
	    <ShortQ map={negMap} text="Emotional State" val={nowEmotion} setter={setNowEmotion}/>
	    <ShortQ map={lowMap} text="Emotional Intensity" val={nowEmoIntensity} setter={setNowEmoIntensity}/>


	    <Text style={{paddingTop:10, paddingBottom:10, fontWeight:'bold'}}> Overall today you felt ___. </Text>
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

	    <FreeQ text="Describe your emotional and focus state today:" val={freeEmotion} setter={setFreeEmotion}/>
	    <FreeQ text="Did you feel anything you would identify as deep ‘flow’ or ‘absorption’-- deep, effortless attention with a lack of self-awareness?  Describe it if so.  Did something prevent this or interrupt it?" val={freeFlow} setter={setFreeFlow}/>
	    <FreeQ text="What activities did you do while working/wearing the device?" val={freeActivities} setter={setFreeActivities}/>
	    <FreeQ text="Have you done any exercise or had any caffeine?  What other food, drinks?" val={freeFood} setter={setFreeFood}/>
	    <FreeQ text="Did you get any emails or have any interactions that stressed you out? Are you waiting on an important email?" val={freeEmails} setter={setFreeEmails}/>
	    <FreeQ text="Did you pay attention to the wearables, and did they alter your state of mind or behavior at all today?" val={freeWearables} setter={setFreeWearables}/>
	    <FreeQ text="Anything else you think is relevant for us to know?" val={freeAdditional} setter={setFreeAdditional}/>



	    <Text style={{paddingTop:25, paddingBottom:10, fontWeight:'bold'}}> Rate these statements about your work day. </Text>

	    <LongQ map={disagreeMap} text="The tasks I engaged in were highly demanding" val={fssA} setter={setFssA}/>
	    <LongQ map={disagreeMap} text="I feel I am competent enough to meet the highest demands of the situation" val={fssB} setter={setFssB}/>
	    <LongQ map={disagreeMap} text="I do things spontaneously and automatically without having to think" val={fssC} setter={setFssC}/>
	    <LongQ map={disagreeMap} text="I have a strong sense of what I want to do" val={fssD} setter={setFssD}/>
	    <LongQ map={disagreeMap} text="I have a good idea while I am performing about how well I am doing" val={fssE} setter={setFssE}/>
	    <LongQ map={disagreeMap} text="I am completely focused on the task at hand" val={fssF} setter={setFssF}/>
	    <LongQ map={disagreeMap} text="I have a feeling of total control" val={fssG} setter={setFssG}/>
	    <LongQ map={disagreeMap} text="I am not worried about what others may be thinking of me" val={fssH} setter={setFssH}/>
	    <LongQ map={disagreeMap} text="The way time passes seems to be different from normal" val={fssI} setter={setFssI}/>
	    <LongQ map={disagreeMap} text="The experience is extremely rewarding" val={fssJ} setter={setFssJ}/>

	    <Text style={{paddingTop:25, paddingBottom:10, fontWeight:'bold'}}> Rate these statements about your life. </Text>
	
	    <LongQ map={disagreeMap} text="There are people who appreciate me as a person" val={bitA} setter={setBitA}/>
	    <LongQ map={disagreeMap} text="I feel a sense of belonging in my community" val={bitB} setter={setBitB}/>
	    <LongQ map={disagreeMap} text="In most activities I do, I feel energized" val={bitC} setter={setBitC}/>
	    <LongQ map={disagreeMap} text="I am achieving most of my goals" val={bitD} setter={setBitD}/>
	    <LongQ map={disagreeMap} text="I can succeed if I put my mind to it" val={bitE} setter={setBitE}/>
	    <LongQ map={disagreeMap} text="What I do in life is valuable and worthwhile" val={bitF} setter={setBitF}/>
	    <LongQ map={disagreeMap} text="My life has a clear sense of purpose" val={bitG} setter={setBitG}/>
	    <LongQ map={disagreeMap} text="I am optimistic about my future" val={bitH} setter={setBitH}/>
	    <LongQ map={disagreeMap} text="My life is going well" val={bitI} setter={setBitI}/>
	    <LongQ map={disagreeMap} text="I feel good most of the time" val={bitJ} setter={setBitJ}/>

	    <EmpaticaCue start={false} setter={setEmpaticaTime}/>






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
			'freeFlow', freeFlow,
			'freeActivities', freeActivities,
			'freeFood', freeFood,
			'freeEmails', freeEmails,
			'freeWearables', freeWearables,
			'freeAdditional', freeAdditional,
			'fssA', fssA,
			'fssB', fssB,
			'fssC', fssC,
			'fssD', fssD,
			'fssE', fssE,
			'fssF', fssF,
			'fssG', fssG,
			'fssH', fssH,
			'fssI', fssI,
			'fssJ', fssJ,
			'bitA', bitA,
			'bitB', bitB,
			'bitC', bitC,
			'bitD', bitD,
			'bitE', bitE,
			'bitF', bitF,
			'bitG', bitG,
			'bitH', bitH,
			'bitI', bitI,
			'bitJ', bitJ,
			'empaticaEndTime', empaticaTime
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

export default EndWorkdaySurvey;
