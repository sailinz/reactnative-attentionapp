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
          <View style={{height:115, width:'100%'}}>

          <StatusView
                glassesStatus={this.props.glassesStatus}
                flowIOStatus={this.props.flowIOStatus}
                // pavlokStatus={this.props.pavlokStatus}
                // watchStatus={this.props.watchStatus}
                firebaseSignedIn={this.props.firebaseSignedIn}
                username={this.props.username}
                setUsername={this.props.setUsername}/>
        </View>

        <View style={{height:150, width:'100%', flexGrow:1, flex:1, flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
        <TouchableOpacity
          style={styles.bigbuttonStyleWide}
          activeOpacity={0.5}
          onPress={() => this.props.navigation.navigate("GlassesDataStream")}>
            <Image source={require('./icons/sun-glasses.png')}
                style={{height:'80%', width: undefined, aspectRatio:1}}/>
            <Text style={{fontSize:16}}>Glasses Data View</Text>
        </TouchableOpacity>
        </View>

        <View style={{height:150, width:'100%', flexGrow:1, flex:1, flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
        <TouchableOpacity
          style={styles.bigbuttonStyleWide}
          activeOpacity={0.5}
          onPress={() => this.props.navigation.navigate("GlassesDataStream")}> 
            <Image source={require('./icons/flowIO_icon.png')}
                style={{height:'80%', width: undefined, aspectRatio:1}}/>
            <Text style={{fontSize:16}}>FlowIO control</Text>
        </TouchableOpacity>
        </View>

        <View style={styles.separator} />
        <View style={styles.separator} />
	  

        <View style={{height:150, width:'100%', flexGrow:1, flex:1, flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
        <TouchableOpacity
          style={styles.bigbuttonStyleWide}
          activeOpacity={0.5}
          onPress={() => this.props.navigation.navigate("FileSelector")}>
            <Image source={require('./icons/file_progress.png')}
                style={{height:'80%', width: undefined, aspectRatio:1}}/>
            <Text style={{fontSize:16}}>File Selector</Text>
        </TouchableOpacity>
        </View>

	<Button
	  title="Start Log" 
          style={styles.smallButtonStyle}
          onPress={() => this.props.buttonPress1()}>
        </Button>
	<Button
	  title="New Log File" 
          style={styles.smallButtonStyle}
          onPress={() => this.props.buttonPress2()}>
        </Button>
	<Button
	  title="Stop Log" 
          style={styles.smallButtonStyle}
          onPress={() => this.props.buttonPress3()}>
        </Button>

        <View style={styles.separator} />
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


