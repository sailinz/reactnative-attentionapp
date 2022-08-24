//Surveys/ReactionTime
//
// Survey for reaction time.
// 
// expects props: trials (number of trials), val (array of reaction times), setter (function to set reaction times array)
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

function ReactionTime(props){
    const [testCount, setTestCount] = useState(props.trials);
    const [touchable, setTouchable] = useState(true);	
    const [running, setRunning] = useState(false);	
    const timer = useRef(null);	
    const transitionTime = useRef(-1);	

    function randomInterval(){
	    //value from 2 sec to 7	    
	    let secs =  0.6;
	    secs += Math.random() * 3.4;
	    return Math.round(secs*1000);
    }
    
    function makeTouchable(){
	    //transition to green at random interval
	    transitionTime.current = new Date().getTime();
	    setTouchable(true);	
    }

    function buttonPress(){
	//button pressed!
  	if (touchable){	//legal press
          // if first press, start running
	  if (!running){
		setRunning(true);
		setTouchable(false);  
		timer.current = setTimeout(makeTouchable, randomInterval());
	  } else {
		// otherwise, update reactiontime arrays
		let reactionTime = new Date().getTime();
		reactionTime -= transitionTime.current;  
		props.setter([...props.val, reactionTime]);
		
		setTouchable(false);
		setTestCount(testCount-1); 

		//if last trial, setRunning false
	        if (testCount <= 1 ) {
		  setRunning(false);	
		} else {
		  //else set timer again
		  timer.current = setTimeout(makeTouchable, randomInterval());
		}
	  }

	}
    }

    return (
	<>
	    <View style={{width:"100%", padding:5}}>
		    <Text style={{fontWeight:"bold", paddingBottom:5}}>Reaction Time Test</Text>
		    <Text style={{textAlign:'justify'}}>Press the button to start; whenever the color changes from red to green, hit the button as fast as you can.  This will happen {props.trials} times quickly in succession.
	                                   </Text>
            </View>

	    {(!running && !touchable) ? <>
	    <View style={{width:"100%", minHeight:75, padding:5, flexDirection:'row', justifyContent:"center", alignItems:'center'}}>
		    <Text style={{fontWeight:"bold", paddingBottom:5}}>DONE! Thank you!</Text>
	    	
	    </View>
	    </>:<>
	    <View style={{width:"100%", minHeight:75, padding:5, flexDirection:'row', justifyContent:"center", alignItems:'center'}}>
		    <View style={{height:65, width:"20%", padding:5, backgroundColor:touchable?'green':'red', justifyContent:"center"}}>
			    <Text style={{fontWeight:"bold", textAlign:"center", backgroundColor:touchable?'green':'red', color:'white', fontSize:20}}>{testCount}</Text>
		    </View>

		<TouchableOpacity
		  style={{width:'50%', height:65, padding:5, justifyContent:"center", alignItems:"center"}}
		  activeOpacity={touchable?0.5:0.2}
		  onPress={() => buttonPress()}>
                <Text style={{width:'100%', padding:10, height:'100%', borderColor: '#7a42f4', 
			      borderWidth: 1, textAlign:'center', fontSize:25}}>
                    It's Green! 
                </Text>
		</TouchableOpacity>
		    
		    <View style={{height:65, width:"20%", padding:5, backgroundColor:touchable?'green':'red', justifyContent:"center"}}>
			    <Text style={{fontWeight:"bold", textAlign:"center", backgroundColor:touchable?'green':'red', color:'white', fontSize:20}}>{testCount}</Text>
		    </View>
	    	
	    </View>

	    </>}

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

export default ReactionTime;
