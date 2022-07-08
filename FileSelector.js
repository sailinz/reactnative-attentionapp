
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */


import storage from '@react-native-firebase/storage';
import {utils} from '@react-native-firebase/app';

import RNFetchBlob from 'rn-fetch-blob';

import React from "react";
import styles from "./Styles";

import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Button,
  RNCSlider,
  TouchableOpacity,
  TextInput,
  Image,
} from "react-native";

import Popover, { Rect } from 'react-native-popover-view';

export default class FileSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {files:['wait, loading files...'], selectedFile:null, popover:false, uploading:false};
	  
  }

  loadFilesFromDisk(){
      RNFetchBlob.fs.ls(utils.FilePath.DOCUMENT_DIRECTORY).then(files => {
	    this.setState({files:files});
      });
  }

  componentDidMount(){	
      this.loadFilesFromDisk();
  }

  closePopover(){
    this.setState({popover: false});
    this.loadFilesFromDisk();
  }

  uploadFile(){
    this.setState({uploading:true});	  
    storage().ref(this.state.selectedFile).putFile(utils.FilePath.DOCUMENT_DIRECTORY + '/' + this.state.selectedFile).then(() => {
       this.setState({uploading: false}); this.closePopover();	    
    }).catch((err) => {console.error(err); })
  }

  deleteFile(){
	RNFetchBlob.fs.unlink(utils.FilePath.DOCUMENT_DIRECTORY + '/' + this.state.selectedFile)
	.then(() => { this.closePopover(); })
	.catch((err) => {console.error(err); })
  }

  render() {
    return (
      <ScrollView>

      <Popover from={new Rect(5, 100, 30, 400)} isVisible={this.state.popover} onRequestClose={() => this.setState({popover: false})}>
            <View style={{width:290, margin:5, height:50, padding:5, justifyContent:'center', alignItems:'center'}}>
            <Text style={{width:290}}>File: {this.state.selectedFile}</Text>
            </View>
	    {this.state.uploading? <View>
                <Text style={{width:'100%', padding:10, paddingTop:5, height: 30, textAlign:'center', alignItems:'center', justifyContent:'center'}}>
                    Upload in Progress...
                </Text>
	    </View>:<><View style={{width:'100%', height:50, padding:5, justifyContent:'center', alignItems:'center'}}>
            <TouchableOpacity
            activeOpacity={0.5}
            onPress={this.uploadFile.bind(this)}>
                <Text style={{width:'100%', padding:10, paddingTop:5, height: 30, borderColor: '#7a42f4', borderWidth: 1, textAlign:'center', alignItems:'center', justifyContent:'center'}}>
                    Upload 
                </Text>
            </TouchableOpacity>
            </View>
            <View style={{width:'100%', height:50, padding:5, justifyContent:'center', alignItems:'center'}}>
            <TouchableOpacity
            activeOpacity={0.5}
            onPress={this.deleteFile.bind(this)}>
                <Text style={{width:'100%', padding:10, paddingTop:5, height: 30, borderColor: '#7a42f4', borderWidth: 1, textAlign:'center', alignItems:'center', justifyContent:'center'}}>
                    Delete
                </Text>
            </TouchableOpacity>
            </View>
            <View style={{width:'100%', height:50, padding:5, justifyContent:'center', alignItems:'center'}}>
            <TouchableOpacity
            activeOpacity={0.5}
            onPress={this.closePopover.bind(this)}>
                <Text style={{width:'100%', padding:10, paddingTop:5, height: 30, borderColor: '#7a42f4', borderWidth: 1, textAlign:'center', alignItems:'center', justifyContent:'center'}}>
                    Close
                </Text>
            </TouchableOpacity>
            </View></>}
        </Popover>



        <View style={{width:'100%', marginTop:5, marginLeft:5, flexGrow:1, flex:1, flexDirection:'row', alignItems:'center'}}>

        <View>
        {this.state.files.map((val) => {
                return (
            <TouchableOpacity
	      key={val+'to'}		
              activeOpacity={0.5}
              onPress={(e) => this.setState({selectedFile: val, popover:true})}>
              <Text key={val+'txt'} style={{width:'100%', padding:10, color:'blue', paddingTop:5, height: 30, textAlign:'center', alignItems:'center'}}>
			{val} 
                </Text>
            </TouchableOpacity>)
        })}
        </View></View>

      </ScrollView>
    )
  }
};

