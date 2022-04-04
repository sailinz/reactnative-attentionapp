import React from "react";
import styles from "./Styles";

import StatusView from "./StatusView.js";

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

export default class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      systemState: "disconnected",
    };
  }

  render() {
    return (
      <ScrollView>
        <View style={styles.viewContainer}>
          <View style={{height:85, width:'100%'}}>

          <StatusView
                glassesStatus={this.props.glassesStatus}
                pavlokStatus={this.props.pavlokStatus}
                firebaseSignedIn={this.props.firebaseSignedIn}
                username={this.props.username}
                setUsername={this.props.setUsername}/>
        </View>


        <View style={{height:150, width:'100%', flexGrow:1, flex:1, flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
        <TouchableOpacity
          style={styles.bigbuttonStyleWide}
          activeOpacity={0.5}
          onPress={() => this.props.navigation.navigate("GlassesCalibrate")}>
            <Image source={require('./icons/sun-glasses.png')}
                style={{height:'80%', width: undefined, aspectRatio:1}}/>
            <Text style={{fontSize:16}}>Glasses Light Calibration</Text>
        </TouchableOpacity>
        </View>

        <View style={{height:150, width:'100%', flexGrow:1, flex:1, flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
        <TouchableOpacity
          style={styles.bigbuttonStyleWide}
          activeOpacity={0.5}
          onPress={() => this.props.navigation.navigate("GlassesTest")}>
            <Image source={require('./icons/sun-glasses.png')}
                style={{height:'80%', width: undefined, aspectRatio:1}}/>
            <Text style={{fontSize:16}}>Glasses Light Test</Text>
        </TouchableOpacity>
        </View>

        <View style={{height:150, width:'100%', flexGrow:1, flex:1, flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
        <TouchableOpacity
          style={styles.bigbuttonStyleWide}
          activeOpacity={0.5}
          onPress={() => this.props.navigation.navigate("PavlokCalibrate")}>
            <Image source={require('./icons/lightning-bolt.png')}
                style={{height:'80%', width: undefined, aspectRatio:1}}/>
            <Text style={{fontSize:16}}>Pavlok Vibrate Calibration</Text>
        </TouchableOpacity>
        </View>

        <View style={{height:150, width:'100%', flexGrow:1, flex:1, flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
        <TouchableOpacity
          style={styles.bigbuttonStyleWide}
          activeOpacity={0.5}
          onPress={() => this.props.navigation.navigate("PavlokTest")}>
            <Image source={require('./icons/lightning-bolt.png')}
                style={{height:'80%', width: undefined, aspectRatio:1}}/>
            <Text style={{fontSize:16}}>Pavlok Vibrate Test</Text>
        </TouchableOpacity>
        </View>

        <View style={styles.separator} />

        <Button
          title="Credits"
          onPress={() => this.props.navigation.navigate("Credits")}
        />

        </View>
      </ScrollView>
    );
  }
}


