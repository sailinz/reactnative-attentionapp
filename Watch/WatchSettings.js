import React from "react";

import StatusView from "../StatusView.js";

import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Button,
  TouchableOpacity,
  Image,
} from "react-native";

import Slider from "@react-native-community/slider";

/*
watchTimeBounds={watchTimeBounds}
watchPaused={watchPaused}
watchUpdateEndHR={watchUpdateEndHR}
watchUpdateStartHR={watchUpdateStartHR}
watchSendUpdateRTC={watchSendUpdateRTC}
watchSendUpdateTimebounds={watchSendUpdateTimebounds}
watchToggleAndSendPaused={watchToggleAndSendPaused}
*/


function WatchSettings(props){
    return (
       <>
       <ScrollView>
        <View style={styles.viewContainer}>
          <View style={{height:115, width:'100%'}}>

          <StatusView
                watchStatus={props.watchStatus}
                firebaseSignedIn={props.firebaseSignedIn}
                username={props.username}
                setUsername={props.setUsername}/>
        </View>

        <View style={styles.separator} />

        <Text style={styles.title}> This button will update the time on the watch to sync it with the phone clock: </Text>
        <Button
        title="Sync Clock"
        color="#010101"
        onPress={props.watchSendUpdateRTC}
        />

        <View style={styles.separator} />

        <Text style={styles.title}> Use the following sliders and button to update the allowed time range for the watch to buzz you between the Start hour and the End hour (24 hr format):</Text>

        <Text style={{fontSize:20, marginHorizontal:16}}> Start Hour: {props.watchTimeBounds[0]}</Text>

        <Slider
        animateTransitions
        animationType="timing"
        onValueChange={value => props.watchUpdateStartHR(value)}
        step={1}
        minimumValue={0}
        maximumValue={23}
        value={props.watchTimeBounds[0]}
        style={{ width: "80%", marginHorizontal: "10%" }}
        />

        <Text style={{fontSize:20, marginHorizontal:16}}> End Hour: {props.watchTimeBounds[1]}</Text>

        <Slider
        animateTransitions
        animationType="timing"
        onValueChange={value => props.watchUpdateEndHR(value)}
        step={1}
        minimumValue={0}
        maximumValue={23}
        value={props.watchTimeBounds[1]}
        style={{ width: "80%", marginHorizontal: "10%" }}
        />

        <Button
        title="Update Time Bounds"
        color="#010101"
        onPress={props.watchSendUpdateTimeBounds}
        />

        <View style={styles.separator} />
        <Text style={styles.title}> Use this button to stop the watch from interrupting you. You can unpause on the watch with this button or by pressing a button on the watch itself.</Text>

        <Button
        title={props.watchPaused ? "Unpause the Watch" : "Pause the Watch"}
        color={props.watchPaused ? 'green' : 'red'}
        onPress={props.watchToggleAndSendPaused}
        />

        </View>
        </ScrollView>
        </>

    );

}

const styles = StyleSheet.create({
  container: {},
  content: {
    alignItems: 'stretch',
    flex: 1,
    justifyContent: 'center'
  },
  title: {
    textAlign: 'center',
    marginVertical: 8,
    marginHorizontal: 16
  },
  form: {
    width: '100%'
  },
  item: {},
  fixToText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  separator: {
    marginVertical: 8,
    borderBottomColor: '#737373',
    borderBottomWidth: StyleSheet.hairlineWidth,
  }
});

export default WatchSettings;
