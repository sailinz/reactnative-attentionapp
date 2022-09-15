//Surveys/EndGame1Survey
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

const optMap = {
    1: 'very rough (easily more than 15 min off)',
    2: 'rough (probably within 15 min)',
    3: 'close (probably within 5 min)',
    4: 'very close (probably within 3 min)',
    5: 'precise (probably within 1 min)'
};

function EndGame1Survey(props){
    const [reactionTimes, setReactionTimes] = useState([]);	

    const [gameDropOpen, setGameDropOpen] = useState(false);
    const [gameDropChoice, setGameDropChoice] = useState(null);
    const [gameDropItems, setGameDropItems] = useState([
	{label:'Prune', value:'prune'},
	{label:'Tik-tok', value:'tiktok'},
	{label:'Relaxing TV', value:'relaxingTV'},
	{label:'Tetris', value:'tetris'}
    ]);

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

    const [confidence, setConfidence] = useState(-1);	
    const [time, setTime] = useState('');
    const [actualTimeAtGuess, setActualTimeAtGuess] = useState('');	
    const [timeValid, setTimeValid] = useState(false);

    const handleTimeChange = (time, validTime) => {
	    if (!validTime) return;
	    setTime(time);
	    setTimeValid(true);
    }
 
    useEffect(() => {
	    console.log('HANDLE TIME');
	    setActualTimeAtGuess(new Date().toLocaleString())
    }, [time]);

    const [lastClockConfidence, setLastClockConfidence] = useState(-1);	
    const [lastClock, setLastClock] = useState('');
    const [lastClockValid, setLastClockValid] = useState(false);

    const handleLastClockChange = (time, validTime) => {
	    if (!validTime) return;
	    setLastClock(time);
	    setLastClockValid(true);
    }

    const [dur, setDur] = useState(null);	
    const [actualTimeAtDuration, setActualTimeAtDuration] = useState('');	

    const handleDurChange = (duration) => {
	    if (duration > 0 && duration < 241){
		    setDur(String(duration));
	    }	
    }
	
    useEffect(() => {
	    console.log('HANDLE DUR');
	    setActualTimeAtDuration(new Date().toLocaleString())
    }, [dur]);

    return (
	<>
	    <View style={{width:"100%", flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
		    <Text style={{fontWeight:'bold', padding:15}}> End Activity #1 Survey </Text>
	    </View>

	    <ScrollView keyboardShouldPersistTaps='handled'>

            <View style={{width:"100%", padding:5, alignItems:'flex-start'}}>
		    <Text>What time do you think it is now?</Text>
            </View>

	    <TimeInput
		initialTime={0}
		onTimeChange={handleTimeChange}
	    />
    	    {timeValid?<Text>Current time entered is: {time}</Text>:<></>}
	    


            <View style={{width:"100%", padding:5, paddingTop:40, alignItems:'flex-start'}}>
		    <Text>How confident are you about your time estimate?</Text>
            </View>

	    <View style={{width:"100%", flexDirection:'row', padding:15, justifyContent:'center', alignItems:'center'}}>
		    <Text style={{fontWeight:'bold'}}>{optMap[confidence]}</Text>
	    </View>

	    <View style={{width:"100%", padding:5, flexDirection:'row', justifyContent:"flex-start", alignItems:'center'}}>
            <Slider
            onValueChange={sliderValue => setConfidence(parseInt(sliderValue))}
            minimumValue={1}
            maximumValue={5}
            step={1}
            value={confidence}
            style={{width:"100%"}}
            />

	    </View>

            <View style={{width:"100%", padding:5, paddingTop:40, alignItems:'flex-start'}}>
		    <Text>How long do you think you've been playing this activity (in mins)?</Text>
            </View>

	    <TextInput
	    keyboardType="number-pad"
      	    maxLength={3}
	    onChangeText={text => handleDurChange(parseInt(text))}
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


    	    <Text style={{paddingTop:20}}>Duration entered is: {dur} min</Text>



            <View style={{width:"100%", padding:5, paddingTop:30, alignItems:'flex-start'}}>
		    <Text>What time was it when you last remember seeing a clock?</Text>
            </View>

	    <TimeInput
		initialTime={0}
		onTimeChange={handleLastClockChange}
	    />
    	    {lastClockValid?<Text>Current time entered is: {lastClock}</Text>:<></>}
	    


            <View style={{width:"100%", padding:5, paddingTop:40, alignItems:'flex-start'}}>
		    <Text>How confident are you about that time?</Text>
            </View>

	    <View style={{width:"100%", flexDirection:'row', padding:15, justifyContent:'center', alignItems:'center'}}>
		    <Text style={{fontWeight:'bold'}}>{optMap[lastClockConfidence]}</Text>
	    </View>

	    <View style={{width:"100%", padding:5, flexDirection:'row', justifyContent:"flex-start", alignItems:'center'}}>
            <Slider
            onValueChange={sliderValue => setLastClockConfidence(parseInt(sliderValue))}
            minimumValue={1}
            maximumValue={5}
            step={1}
            value={lastClockConfidence}
            style={{width:"100%"}}
            />

	    </View>



	    <Text style={{paddingTop:30, paddingBottom:10, fontWeight:'bold'}}> During the activity, rate your: </Text>
	    <ShortQ map={lowMap} text="Level of Focus" val={focusHour} setter={setFocusHour}/>
	    <ShortQ map={lowMap} text="Effort Required to Focus" val={focusEffort} setter={setFocusEffort}/>
	    <ShortQ map={lowMap} text="Experienced Flow" val={focusFlow} setter={setFocusFlow}/>
	    <ShortQ map={durationMap} text="Duration of Flow" val={focusDuration} setter={setFocusDuration}/>


	    <Text style={{paddingTop:10, paddingBottom:10, fontWeight:'bold'}}> Overall during the activity you felt ___. </Text>
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


	    <Text style={{paddingTop:25, paddingBottom:10, fontWeight:'bold'}}> Rate these statements about your experience. </Text>

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

	    <FreeQ text="Describe your emotional and focus state during the activity:" val={freeEmotion} setter={setFreeEmotion}/>
	    <FreeQ text="Did you feel anything you would identify as deep ‘flow’ or ‘absorption’-- deep, effortless attention with a lack of self-awareness?  Describe it if so.  Did something prevent this or interrupt it?" val={freeFlow} setter={setFreeFlow}/>
	    <FreeQ text="Any caffeine, food, or drinks while playing?" val={freeFood} setter={setFreeFood}/>
	    <FreeQ text="Did you pay attention to the wearables, and did they alter your state of mind or behavior during the activity?" val={freeWearables} setter={setFreeWearables}/>
	    <FreeQ text="Anything else you think is relevant for us to know?" val={freeAdditional} setter={setFreeAdditional}/>

            <ReactionTime trials={13} val={reactionTimes} setter={setReactionTimes}/>			    

	    <Text style={{paddingTop:10, paddingBottom:10, fontWeight:'bold'}}> How do you feel now? </Text>
	    <ShortQ map={lowMap} text="Alertness" val={nowAlertness} setter={setNowAlertness}/>
	    <ShortQ map={lowMap} text="Stress" val={nowStress} setter={setNowStress}/>
	    <ShortQ map={negMap} text="Emotional State" val={nowEmotion} setter={setNowEmotion}/>
	    <ShortQ map={lowMap} text="Emotional Intensity" val={nowEmoIntensity} setter={setNowEmoIntensity}/>

	    <Text style={{paddingBottom:30, paddingTop:30}}> You are about to start your second activity!  Please select an activity you have not done from the drop-down below: </Text>

	    <DropDownPicker open={gameDropOpen} value={gameDropChoice} items={gameDropItems} listMode="SCROLLVIEW"
	    	setOpen={setGameDropOpen} setValue={setGameDropChoice} setItems={setGameDropItems}/>

	    <Text style={{paddingBottom:10, paddingTop:30}}>Make sure you have your wearables on and the activity pulled up on your iPad. When you notice the peripheral light in your vision has turned from blue to green, indicate it by hitting the button in the app.  Please silence potential interruptions and hide any clocks from view; please make sure you have 1 hour available so you're not stressed.   When you're ready, hit start below and start!  </Text>


	    <View style={{...styles.separator, padding:20}} />

            <View style={{width:'100%', height:50, padding:5, justifyContent:'center', alignItems:'center'}}>
            <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => {props.onSubmitted([
                        'time', time, 'actualTimeAtGuess', actualTimeAtGuess, 'confidence', confidence, 
		        'duration', dur, 'actualTimeAtDuration', actualTimeAtDuration,
                        'lastClockEstimate', lastClock, 'lastClockConfidence', lastClockConfidence, 
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
		    	'reactionTimesMs', String(reactionTimes),
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
		        'Game2', gameDropChoice
		    ]);}}>
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

export default EndGame1Survey;
