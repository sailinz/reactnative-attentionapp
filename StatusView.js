//StatusView.js
//
//Display BLE Connection Status and username input
//can take plavlok and glasses status;
//if one is set to null it will render the other
//
//
//REQUIRES: props --> pavlokStatus: {connected:false, text:'listening'}
//                    glassesStatus: {connected:true, text:'connected'}
//                    firebaseSignedIn: False
//                    username: ""
//                    setUsername: func
//

import React from "react";

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

function StatusView(props){
    return (
        <View style={styles.container}>

            <View style={{width:60, height:60,marginRight:5}}>
            <Image source={require('./icons/bluetooth.png')}
                style={{width:'100%', height: undefined, aspectRatio:1}}/>
            </View>

            <View style={{height:60, width:'50%', justifyContent:'center', alignItems:'center', flex:1, flexDirection:'column'}}>
            {props.glassesStatus!=null ?
                <View style={{width:'100%', flexGrow:1, flex:1, flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
                    <View style={{margin:5, width:20, height:20}}>
                        <Image source={require('./icons/sun-glasses.png')}
                            style={{width:'100%', height: undefined, aspectRatio:1}}/>
                    </View>
                    <View style={{flexGrow:1, height:30, justifyContent:'center', flex:1}}>
                        <Text style={{fontSize:12, color:props.glassesStatus=='Connected.'?'green':'red'}}> {props.glassesStatus} </Text>
                    </View>
                </View>
            :null}

            {props.pavlokStatus!=null ?
                <View style={{width:'100%', flexGrow:1, flex:1, flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
                    <View style={{margin:5, width:20, height:20}}>
                        <Image source={require('./icons/lightning-bolt.png')}
                            style={{width:'100%', height: undefined, aspectRatio:1}}/>
                    </View>
                    <View style={{flexGrow:1, height:30, justifyContent:'center', flex:1}}>
                        <Text style={{fontSize:12, color:props.pavlokStatus=='Connected.'?'green':'red'}}> {props.pavlokStatus} </Text>
                    </View>
                </View>
            :null}
            </View>

            <View style={{flexGrow:1, height:60, flex:1, justifyContent:'center', alignItems:'center'}}>
                <View style={{width:'100%', height:30, flex:1, flexDirection:'row', justifyContent:'center', alignItems:'center'}}>

                    <View style={{width:'100%', flexGrow:1, flex:1, flexDirection:'row', justifyContent:'center', alignItems:'center'}}>

                    <TextInput style={{ backgroundColor: '#ededed', height: 34, width: '60%', margin:5, borderColor: '#7a42f4', borderWidth: 1}} autoCapitalize = 'none'
                        value ={props.username}
                        onChangeText = {props.setUsername}/>
                    </View>

                </View>
                    {props.firebaseSignedIn ?
                    <Text style={{fontSize:10}}>username</Text>:
                    <Text style={{fontSize:10, color:'red'}}>not signed in</Text>
                    }


            </View>

        </View>

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

export default StatusView;
