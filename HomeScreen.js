import React, { useEffect, useState, useRef } from "react";
import styles from "./Styles";

import StatusView from "./StatusView.js";
import { useFocusEffect, useIsFocused } from '@react-navigation/native';

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
  Image,
} from "react-native";

function HomeScreen(props) {

    const disconnectTimer = useRef(null);
    const isFocused = useIsFocused();
    
    //IF on the homescreen-- start scanning when comes into view if any of the three devices are not connected.
    //IF glasses/watch connect, scan for pavlok for an additional 10 seconds before stopping.  Otherwise scan indefinitely.	
    useFocusEffect(
	    React.useCallback(() => {
		console.log('CALLED HOMESCREEN FOCUS');

		if (!props.scanning && (props.watchStatus != 'Connected.' || props.pavlokStatus != 'Connected.' || props.glassesStatus != 'Connected.')){
			props.setScanning(true);
		}
		
		if (props.watchStatus == 'Connected.' && props.glassesStatus == 'Connected.'){
			console.log('both glasses/watch connected; stop scan in 10s');	
			disconnectTimer.current = setTimeout(() => {
			  console.log('stop scanning');	
			  props.setScanning(false);
			}, 10000);
		}
		
		return (() => {
		 console.log('HOMESCREEN UNFOCUSED');
	  	 clearTimeout(disconnectTimer.current);	
		});

	    }, [])
    );

   useEffect(() => {
	if (isFocused) {   
		console.log('watch/glasses status updated in homescreen focus');   

		if (props.watchStatus == 'Connected.' && props.glassesStatus == 'Connected.'){
			console.log('both glasses/watch connected; stop scan in 10s');	
			disconnectTimer.current = setTimeout(() => {
			  console.log('stop scanning');	
			  props.setScanning(false);
			}, 10000);
		} else {
			  props.setScanning(true);
		}
	}
   }, [props.glassesStatus, props.watchStatus]);

    return (
      <ScrollView>
        <View style={styles.viewContainer}>
          <View style={{height:115, width:'100%'}}>

          <StatusView
                glassesStatus={props.glassesStatus}
                pavlokStatus={props.pavlokStatus}
                watchStatus={props.watchStatus}
                firebaseSignedIn={props.firebaseSignedIn}
                username={props.username}
                setUsername={props.setUsername}
	        pic={props.scanning?"scanning":"bluetooth"} 
	        connect={props.connect}/>
        </View>


        <View style={{height:150, width:'100%', flexGrow:1, flex:1, flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
        <TouchableOpacity
          style={styles.bigbuttonStyleWide}
          activeOpacity={0.5}
          onPress={() => props.navigation.navigate("WorkingSession")}>
	    <View style={{flexDirection:'row', justifyContent:'center'}}>
            <Image source={require('./icons/sun-glasses.png')}
                style={{height:'80%', width: undefined, aspectRatio:1}}/>
            <Image source={require('./icons/wristwatch.png')}
                style={{height:'80%', width: undefined, aspectRatio:1}}/>
	    </View>
            <Text style={{fontSize:16}}>Working Session</Text>
        </TouchableOpacity>
        </View>

        <View style={{height:150, width:'100%', flexGrow:1, flex:1, flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
        <TouchableOpacity
          style={styles.bigbuttonStyleWide}
          activeOpacity={0.5}
          onPress={() => props.navigation.navigate("VideogameSession")}>
	    <View style={{flexDirection:'row', justifyContent:'center'}}>
            <Image source={require('./icons/sun-glasses.png')}
                style={{height:'80%', width: undefined, aspectRatio:1}}/>
            <Image source={require('./icons/wristwatch.png')}
                style={{height:'80%', width: undefined, aspectRatio:1}}/>
	    </View>
            <Text style={{fontSize:16}}>Video Game Session</Text>
        </TouchableOpacity>
        </View>

        <View style={{height:150, width:'100%', flexGrow:1, flex:1, flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
        <TouchableOpacity
          style={styles.bigbuttonStyleWide}
          activeOpacity={0.5}
          onPress={() => props.navigation.navigate("GlassesDataStream")}>
            <Image source={require('./icons/sun-glasses.png')}
                style={{height:'80%', width: undefined, aspectRatio:1}}/>
            <Text style={{fontSize:16}}>Glasses Data View</Text>
        </TouchableOpacity>
        </View>

        <View style={{height:150, width:'100%', flexGrow:1, flex:1, flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
        <TouchableOpacity
          style={styles.bigbuttonStyleWide}
          activeOpacity={0.5}
          onPress={() => props.navigation.navigate("GlassesCalibrate")}>
            <Image source={require('./icons/sun-glasses.png')}
                style={{height:'80%', width: undefined, aspectRatio:1}}/>
            <Text style={{fontSize:16}}>Glasses Light Calibration</Text>
        </TouchableOpacity>
        </View>

        <View style={{height:150, width:'100%', flexGrow:1, flex:1, flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
        <TouchableOpacity
          style={styles.bigbuttonStyleWide}
          activeOpacity={0.5}
          onPress={() => props.navigation.navigate("GlassesTest")}>
            <Image source={require('./icons/sun-glasses.png')}
                style={{height:'80%', width: undefined, aspectRatio:1}}/>
            <Text style={{fontSize:16}}>Glasses Light Test (no datastream)</Text>
        </TouchableOpacity>
        </View>

        <View style={{height:150, width:'100%', flexGrow:1, flex:1, flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
        <TouchableOpacity
          style={styles.bigbuttonStyleWide}
          activeOpacity={0.5}
          onPress={() => props.navigation.navigate("PavlokCalibrate")}>
            <Image source={require('./icons/lightning-bolt.png')}
                style={{height:'80%', width: undefined, aspectRatio:1}}/>
            <Text style={{fontSize:16}}>Pavlok Vibrate Calibration</Text>
        </TouchableOpacity>
        </View>

        <View style={{height:150, width:'100%', flexGrow:1, flex:1, flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
        <TouchableOpacity
          style={styles.bigbuttonStyleWide}
          activeOpacity={0.5}
          onPress={() => props.navigation.navigate("PavlokTest")}>
            <Image source={require('./icons/lightning-bolt.png')}
                style={{height:'80%', width: undefined, aspectRatio:1}}/>
            <Text style={{fontSize:16}}>Pavlok Vibrate Test</Text>
        </TouchableOpacity>
        </View>

        <View style={styles.separator} />
        <View style={styles.separator} />
	    
        <View style={{height:150, width:'100%', flexGrow:1, flex:1, flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
        <TouchableOpacity
          style={styles.bigbuttonStyleWide}
          activeOpacity={0.5}
          onPress={() => props.navigation.navigate("WatchSettings")}>
            <Image source={require('./icons/wristwatch.png')}
                style={{height:'80%', width: undefined, aspectRatio:1}}/>
            <Text style={{fontSize:16}}>Watch Settings</Text>
        </TouchableOpacity>
        </View>

        <View style={{height:150, width:'100%', flexGrow:1, flex:1, flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
        <TouchableOpacity
          style={styles.bigbuttonStyleWide}
          activeOpacity={0.5}
          onPress={() => props.navigation.navigate("FileSelector")}>
            <Image source={require('./icons/file_progress.png')}
                style={{height:'80%', width: undefined, aspectRatio:1}}/>
            <Text style={{fontSize:16}}>File Selector</Text>
        </TouchableOpacity>
        </View>

        <View style={{height:150, width:'100%', flexGrow:1, flex:1, flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
        <TouchableOpacity
          style={styles.bigbuttonStyleWide}
          activeOpacity={0.5}
          onPress={() => props.navigation.navigate("VideogamePrototype")}>
	    <View style={{flexDirection:'row', justifyContent:'center'}}>
            <Image source={require('./icons/sun-glasses.png')}
                style={{height:'80%', width: undefined, aspectRatio:1}}/>
            <Image source={require('./icons/wristwatch.png')}
                style={{height:'80%', width: undefined, aspectRatio:1}}/>
	    </View>
            <Text style={{fontSize:16}}>Video Game Short Test Session</Text>
        </TouchableOpacity>
        </View>

	<Button
	  title="Start Log" 
          style={styles.smallButtonStyle}
          onPress={() => props.buttonPress1()}>
        </Button>
	<Button
	  title="New Log File" 
          style={styles.smallButtonStyle}
          onPress={() => props.buttonPress2()}>
        </Button>
	<Button
	  title="Stop Log" 
          style={styles.smallButtonStyle}
          onPress={() => props.buttonPress3()}>
        </Button>

        <View style={styles.separator} />
        <View style={styles.separator} />

        <Button
          title="Credits"
          onPress={() => props.navigation.navigate("Credits")}
        />

        </View>
      </ScrollView>
    );
}

export default HomeScreen;
