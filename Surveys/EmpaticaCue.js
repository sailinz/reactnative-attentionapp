//Surveys/Empatica Cue
//
// Instruction to start and stop Empatica
// 
// expects props: start (true if starting, false if stopping device), setter (function to set kick off time)
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

function EmpaticaCue(props){
    const [count, setCount] = useState(3);
    const [done, setDone] = useState(false);	
    const [counting, setCounting] = useState(false);	
    const timer = useRef(null);	

    useEffect(() => {

       if(count==0){
	  props.setter(new Date().toLocaleString());
       } 

       if (count < -1 ){
	  setDone(true);
       } else if (count < 3){
          timer.current = setTimeout(countdown, 1000);
       }

    }, [count]);	

    function countdown(){
	setCount(count-1);
    }

    function buttonPress(){
	        setCounting(true);
		timer.current = setTimeout(countdown, 1000);
    }

    return (
	<>
	    <View style={{width:"100%", padding:5}}>
	    {props.start ? <>
		    <Text style={{fontWeight:"bold", paddingBottom:5}}>Start Empatica Recording</Text>
		    <Text style={{textAlign:'justify'}}>Please put on the empatica device on your non-dominant hand.  Start the countdown below, and when the timer hits zero, press and hold the button on the Empatica.  After 2 seconds, an LED will illuminate and you can let go.
	                                   </Text>
		    </>:<>
		    <Text style={{fontWeight:"bold", paddingBottom:5}}>Stop Empatica Recording</Text>
		    <Text style={{textAlign:'justify'}}>Please start the countdown below, and when the timer hits zero, press and hold the button on the Empatica until the LED flashes.
	                                   </Text>
		    </>
	    }
            </View>

	    {done ? <>
	    <View style={{width:"100%", minHeight:75, padding:5, flexDirection:'row', justifyContent:"center", alignItems:'center'}}>
		    <Text style={{fontWeight:"bold", paddingBottom:5}}>DONE! Thank you!</Text>
	    	
	    </View>
	    </>:<>
	    <View style={{width:"100%", minHeight:75, padding:5, flexDirection:'row', justifyContent:"center", alignItems:'center'}}>

		<TouchableOpacity
		  style={{width:'70%', height:65, padding:5, justifyContent:"center", alignItems:"center"}}
		  activeOpacity={0.5}
		  onPress={() => buttonPress()}>
                <Text style={{width:'100%', padding:10, height:'100%', borderColor: '#7a42f4', 
			      borderWidth: 1, textAlign:'center', fontSize:25}}>
			Start Countdown
                </Text>
		</TouchableOpacity>
		    
		    <View style={{height:65, width:"30%", padding:5, justifyContent:"center"}}>
		            {counting && <>
				    {(count > 0) ?
				    <Text style={{fontWeight:"bold", textAlign:"center", fontSize:20}}>{count}</Text>:
				    <Text style={{fontWeight:"bold", textAlign:"center", fontSize:20}}>PRESS!</Text>}
			    </>}	    
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

export default EmpaticaCue;
