/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */


// privacy and thermal comfort, robust across activities, dynamic
// for navigation : https://www.digitalocean.com/community/tutorials/react-react-native-navigation

"use strict";

import {decode as atob, encode as btoa} from 'base-64'

import "react-native-gesture-handler";
import React, { useEffect, useState, useRef } from "react";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { Dimensions } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import {utils} from '@react-native-firebase/app';

import HomeScreen from "./HomeScreen";
import FileSelector from "./FileSelector";

import FlowIOControl from "./FlowIOControl";

import GlassesCalibrate from "./GlassesTests/glassesCalibrate";
import GlassesDataStream from "./GlassesDataStream";
import GlassesTest from "./GlassesTests/glassesTest";
import { Chart, SetData } from "@dpwiese/react-native-canvas-charts/ChartJs";

import styles from "./Styles";

import { BleManager } from "react-native-ble-plx";

import AsyncStorage from '@react-native-async-storage/async-storage'
import RNFetchBlob from 'rn-fetch-blob';

import { Buffer } from 'buffer';
const struct = require('python-struct');


const CAPTIVATES_SERVICE_UUID = "0000fe80-8e22-4541-9d4c-21edae82ed19";
const CAPTIVATES_LED_UUID = "0000fe84-8e22-4541-9d4c-21edae82ed19";
const CAPTIVATES_RX_UUID = "0000fe81-8e22-4541-9d4c-21edae82ed19";

'use strict'
const controlServiceUUID    = '0b0b0b0b-0b0b-0b0b-0b0b-00000000aa04';
const chrCommandUUID        = '0b0b0b0b-0b0b-0b0b-0b0b-c1000000aa04';
const chrHardwareStatusUUID = '0b0b0b0b-0b0b-0b0b-0b0b-c2000000aa04';


//const packetPadding = capLogPacket.LOG_PACKET_SIZE * 2;
const Stack = createStackNavigator();
const bleManager = new BleManager();

const dataCollection = firestore().collection('data');

function App() {

    //-- CREATE APP STATE --//
    //user id
    const [userInitialized, setUserInitialized] = useState(false);
    const [user, setUser] = useState();
    const [username, setUsername] = useState();
    const [dataArray, setDataArray] = useState([]);

    const [streamDataUI, setStreamDataUI] = useState(false);	
    const streamDataUIref = useRef(false);

    const [glassesBlinkData, setGlassesBlinkData] = useState(Array(3000).fill(0));
    const [glassesThermalData, setGlassesThermalData] = useState(Array(100).fill([0,0]));
    const [glassesAccData, setGlassesAccData] = useState(Array(100).fill([0,0,0]));
    const [glassesGyroData, setGlassesGyroData] = useState(Array(100).fill([0,0,0]));

    const [packetCount, setPacketCount] = useState({thermal:0, blink:0, acc:0, gyro:0});

    const firebaseAuthDebounceTimer = useRef(null);

    const fileOpen = useRef(null);
    const fileStream = useRef(null);

    //db connections
    const [firestoreInitialized, setFirestoreInitialized] = useState(false);

    //ble state
    const [glassesBleState, setGlassesBleState] = useState('');
    const [flowIOBleState, setFlowIOBleState] = useState('');

    //-- NON-REACT STATE --//

    //state in React is only state THAT HAS A VIEW EFFECT
    //other state can just be local variables etc.  State/props
    //are tracked by React to decide when/how to re-render components
    //if it doesn't have a view effect it doesn't need to be tracked
    const localBleState = useRef({
        scanned_devices: {},
        connected_devices: {
            glasses: null,
            flowIO: null,
        },
        writeCharacteristics: {
            glassesLED: null,
            flowIO: null,
        },
        readSubscriptions: {
            glasses: null,
        },
    });


	function getEveryNth(arr, nth) {
	  const result = [];

	  for (let i = 0; i < arr.length; i += nth) {
	    result.push(arr[i]);
	  }

	  return result;
	}

    function updateGlassesData(key, value) {
        try{    
            var hexraw = base64ToHex(value);
          var parsedPayload = struct.unpack(
                        'HHIIIIIIII',
                        Buffer.from(hexraw, 'hex').slice(0,36));
            //console.log(parsedPayload[0]);
        //console.log(parsedPayload); //i.e. [5, 92, 38148, 0, 200, NaN, NaN, NaN, NaN, NaN]
        //packetType, packetNum, msFromStart, epoch, PacketSize
        
        switch(parsedPayload[0]){
    
            case 5:
    
                    var blinkData = struct.unpack(
                    parsedPayload[4] + 'B',
                    Buffer.from(hexraw, 'hex').slice(36));
    
                if (fileOpen.current != null){
                    dataLog('g',['b', ...parsedPayload, 'PAYLOAD', ...blinkData]);
                }
                
                if (streamDataUIref.current){
    
                    setGlassesBlinkData((prev) => [...prev.slice(blinkData.length), ...blinkData]);
                }/* else{
                    setPacketCount(prev => ({...prev, blink: prev.blink + 1}));
                }*/
    
                break;
    
            case 6:
    
                var thermalData = struct.unpack(
                        'HHIHHIHHIHHIHHIHHIHHIHHIHHIHHIII'.repeat(4),
                        Buffer.from(hexraw, 'hex').slice(36));
                
                //The total data packet is 128 values.
                //The packet structure has 32 values repeated 4 times; step one is dividing the packet into four.
                //Within that 32 values (1/4 of data) are 5 repetitions of 6 pieces of data
                //
                // We'd like that to be ['temple_tp', 'temple_thermistor', 'secondary_temple_tick_ms'...
                //, 'nose_tp', 'nose_thermistor', 'secondary_nose_tick_ms'] (30 values) with 2 values appended for 'tick_ms' and 'epoch'
                //
                // But that's not how the values come in; it's (five groups of [3 temple values] , five groups of [3 corresponding nose values], [tick, epoch])
                // Within that 32 value structure, to arrange the values so that they're time aligned, we need to match 0 with 5, 1 with 6, etc 
                // i.e. the proper order is: [0, 1, 2], [15, 16, 17], [3, 4, 5], [18, 19, 20] ... to get the structure we'd 'like'. 
                
                if (fileOpen.current != null){
                    dataLog('g',['t', ...parsedPayload, 'PAYLOAD', ...thermalData]);
                }
    
                
                if (streamDataUIref.current){	
    
                    //for now, we can pull temple_tp and nose_tp to plot
                    // temple_tp = [0,3,6,9,12]; nose_tp = [15,18,21,24,27]
                    let thermalPlotVals = [];
                    for (let i=0; i<5; i++){
                        thermalPlotVals.push([thermalData[i*3], thermalData[i*3+15]]);
                    }
    
                    setGlassesThermalData((prev) => [...prev.slice(thermalPlotVals.length), ...thermalPlotVals]);
                }/* else{	
                    setPacketCount(prev => ({...prev, thermal: prev.thermal + 1}));
                }*/
    
                break;
    
            case 7:
    
                    var accData = struct.unpack(
                    'hhhII'.repeat(25),
                    Buffer.from(hexraw, 'hex').slice(36));
    
                if (fileOpen.current != null){
                    dataLog('g',['a', ...parsedPayload, 'PAYLOAD', ...accData]);
                }
    
                if (streamDataUIref.current){
    
                    let accPlotVals = [];
                    for (let i=0; i<25; i++){
                        accPlotVals.push(accData.slice(i*5,i*5+3));
                    }
    
                    setGlassesAccData((prev) => [...prev.slice(accPlotVals.length), ...accPlotVals]);
                }/* else{
                    setPacketCount(prev => ({...prev, acc: prev.acc + 1}));
                }*/
    
                break;
            case 9:
    
                    var gyroData = struct.unpack(
                    'hhhII'.repeat(25),
                    Buffer.from(hexraw, 'hex').slice(36));
    
                if (fileOpen.current != null){
    
                    dataLog('g',['g', ...parsedPayload, 'PAYLOAD', ...gyroData]);
                }
    
                if (streamDataUIref.current){
    
                    let gyroPlotVals = [];
                    for (let i=0; i<25; i++){
                        gyroPlotVals.push(gyroData.slice(i*5,i*5+3));
                    }
    
                    setGlassesGyroData((prev) => [...prev.slice(gyroPlotVals.length), ...gyroPlotVals]);
                }/* else{
                    setPacketCount(prev => ({...prev, gyro: prev.gyro + 1}));
                }*/	
    
                break;
    
            default:
                console.error('UNKOWN PACKET TYPE');
        }
        }catch(e){
           console.error('Failed to read BLE packet from Glasses, likely unpack failure');
        }
        
    }

    function sendLEDUpdate(ledArray){
      localBleState.current.writeCharacteristics.glassesLED.writeWithoutResponse(hexToBase64(bytesToHex(ledArray.slice(0))), null).catch((error) => {
	    console.error('LED WRITE TO GLASSES NOT WORKING');
        setGlassesBleState('ERROR');
        scanAndConnect();
      });
    }

    function sendPort1Update(portActArray){
        console.log(portActArray);
        localBleState.current.writeCharacteristics.flowIO.writeWithoutResponse(portActArray, null).catch((error) => {
            console.error('Flow IO write failure');
            // rscanAndConnect();
          });

    }


    //-- FILE IO -- //

    async function writeLineToDisk(arrayToCsvLine){
        if (fileOpen.current == null){
        console.error('CANNOT WRITE TO UNOPENED FILESubscriptions!!!')	
        try {	
                fileStream.current = await fileStream.current.close();
        } catch(e){
            console.error(e);
        }	  
        return false;
        } else {
        try {	
            fileStream.current = await fileStream.current.write(String(arrayToCsvLine)+'\n');	
                return true;	
        } catch(e){
            console.log('ERROR WRITING FILE!!!')	
                console.error(e);		  
            fileOpen.current = null;
            try {	
            fileStream.current = await fileStream.current.close();
            } catch(e){
            console.error(e);
            }	  
            return false;	
        }
        }
    }

    async function log(type, string){	
        let currentTimestamp = new Date().toISOString();
        //console.log('LOG:' + type + ', ' + string);    
        return await writeLineToDisk(['l', currentTimestamp, type, string]); 	
    }

    async function dataLog(type, dataArray){	
        let currentTimestamp = new Date().toISOString();
        //console.log('dataLOG:' + type + ', ' + dataArray);    
        return await writeLineToDisk([type, currentTimestamp, ...dataArray]); 	
    }

    async function asciiStreamOpen(callingFunc)	{
	//saving in document directory
	 
        if (fileOpen.current != null){
        console.error('FILE ALREADY OPEN!!!')	
        return false;
        } else {
        let time = new Date();    
        let t = time.toLocaleString('en-us', 
            {year: '2-digit', month: '2-digit', day: '2-digit', 
            hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false});
        t = t.replace(/[^0-9]/g, "");
        let filename = t.slice(0,6) + '_' + t.slice(6) + '_' + username.toLowerCase() + '_' + callingFunc + '.csv';    

        fileStream.current = await RNFetchBlob.fs.writeStream(
            utils.FilePath.DOCUMENT_DIRECTORY + '/' + filename,
            'utf8',
            true);

        console.log('opened file ' + filename);	
        fileOpen.current = filename;	

        await writeLineToDisk(['l', time.toISOString(), 'currentTime', t]); 	

        await log('username', username);
        await log('firebaseUser', user.uid);
        await log('callingFunction', callingFunc);

        try{    
            await log('glassesID', localBleState.current.connected_devices['glasses'].id);
            await log('glassesName', localBleState.current.connected_devices['glasses'].name);
            await log('glassesLocalName', localBleState.current.connected_devices['glasses'].localName);
            await log('glassesGlassesID', localBleState.current.connected_devices['glasses'].glassesID);
            await log('glassesManufacturerData', localBleState.current.connected_devices['glasses'].manufacturerData);
        }catch(e){
            console.error('Not connected to glasses; not logging glasses data');
        }

        return true;	
        }
    }


    async function sendToStorage(keepLogging=true){
        let returnflag = true;    

        //we write to the file if fileOpen.current != null, so shut this down first.    
        let filename = fileOpen.current;    
        fileOpen.current = null;    

        //close file stream if open
        try{	
            console.log('closing file ' + filename);	  
            fileStream.current = await fileStream.current.close();
        } catch(e){
            console.error('failed to close open file ' + filename);	  
            console.error(e);
            returnflag = false;			  
        }

        //upload to storage    
        try {    
            await storage().ref(filename).putFile(utils.FilePath.DOCUMENT_DIRECTORY + '/' + filename);
        }catch(e){
            console.error('error uploading ' + filename);
            console.error(e);
            returnflag = false;			  
        }	

        //open new file if keepLogging
        if (keepLogging){
            let callingFunc = filename.split('_').slice(-1)[0].slice(0,-4) + '_CONTD';
            let success = await asciiStreamOpen(callingFunc); 	
            if (!success) {
                returnflag = false;
            }
        }

        return returnflag;    
    }


    async function startLogging(callingFunc){
       //open file to stream data to; openFile.current != null means we are streaming	    
       return await asciiStreamOpen(callingFunc);
    }

    async function stopLogging(){
        //close open file and send to storage, openFile.current == null means we've stopped streaming    
        return await sendToStorage(false);
    }


    async function buttonPress1(){
	    startLogging('TEST');	
    }

    async function buttonPress2(){
	    sendToStorage();	
    }

    async function buttonPress3(){
	    stopLogging();	
    }

    async function buttonPress(){
	//var filename = 'temp'+ Math.floor(Math.random() * 10) +  '.csv';    

	var callingFunc = 'pavCal';    

	console.log('Pressed Button');
    }

    //-- END FILE IO --//


    function base64ToHex(str) {
        const raw = atob(str);
        let result = '';
        for (let i = 0; i < raw.length; i++) {
            const hex = raw.charCodeAt(i).toString(16);
            result += (hex.length === 2 ? hex : '0' + hex);
        }
        return result.toUpperCase();
    }
        function hexToBase64(str) {
        return btoa(str.match(/\w{2}/g).map(function(a) {
            return String.fromCharCode(parseInt(a, 16));
        }).join(""));
    }

        function decimalToHex(d, padding=2) {
        var hex = Number(d).toString(16);
        padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

        while (hex.length < padding) {
            hex = "0" + hex;
        }

        return hex;
    }

    function bytesToHex(bytes) {
        for (var hex = [], i = 0; i < bytes.length; i++) {
        var current = bytes[i] < 0 ? bytes[i] + 256 : bytes[i];
        hex.push((current >>> 4).toString(16));
        hex.push((current & 0xf).toString(16));
        }
        return hex.join("");
    }



    //https://overreacted.io/making-setinterval-declarative-with-react-hooks/
    //const intervalRSSI = useRef(null);

    //--DERIVED STATE--//
    function glassesReady(){
        return (localBleState.current.writeCharacteristics.glassesLED!=null);
    }

    function flowIOReady(){
        return (localBleState.current.writeCharacteristics.flowIO!=null);
    }

    //--DONE WITH STATE--//


    //--FIREBASE--//
    function onAuthStateChanged(user) {
        if(firebaseAuthDebounceTimer.current) {
            console.log('firebase auth: debounce call');
            clearTimeout(firebaseAuthDebounceTimer.current);
        }

        firebaseAuthDebounceTimer.current = setTimeout(() => {
            firebaseAuthDebounceTimer.current = null;


            setUser(user);

            if (user == null){
                console.log('user signed out');
                return;
            }

            console.log("GOT USER: " + user.uid);

            dataCollection.where("uid","==", user.uid).get().then(querySnapshot => {
                let dArray = [];
                querySnapshot.forEach(doc => {
                        dArray.push(doc.data());
                });

                setDataArray(dArray);

                if (!userInitialized) setUserInitialized(true);

            }, error => {console.log(error.code);});

        }, 200);//end debounce timeout
    }

    async function addData(timestamp, testType, eventType, data, username){
        console.log('sending data for user ' + user.uid);

        let ts = firestore.Timestamp.fromDate(timestamp);
        let datadoc = {
            uid: user.uid,
            username: username,
            timestamp: ts,
            eventType: eventType,
            testType: testType,
            data: data
        };

        setDataArray([...dataArray, datadoc]);
        await dataCollection.add(datadoc);

    }

    //--END FIREBASE--//

    //--UPDATE STATE FUNCTIONS--//


    function disconnectGlasses(){
        console.log('disconnecting Glasses');
        if (localBleState.current.connected_devices['glasses'] != null){
            try{
                localBleState.current.connected_devices['glasses'].cancelConnection();
                localBleState.current.connected_devices['glasses'] = null;
            }catch(err){
                console.log('cancel glasses connection failed');
            }
        }

        localBleState.current.writeCharacteristics['glassesLED'] = null;
    }

    function disconnectFlowIO(){
        console.log('disconnecting Glasses');
        if (localBleState.current.connected_devices['flowIO'] != null){
            try{
                localBleState.current.connected_devices['flowIO'].cancelConnection();
                localBleState.current.connected_devices['flowIO'] = null;
            }catch(err){
                console.log('cancel flowIO connection failed');
            }
        }

        localBleState.current.writeCharacteristics['flowIO'] = null;
    }

    useEffect(() => {
        streamDataUIref.current = streamDataUI;
    }, [streamDataUI])

    useEffect(() => {
        //this will only run on component mount because of empty array
        //passed as second argument to useEffect

        console.log('ON MOUNT CALLED!');
        AsyncStorage.getItem('username').then((username) => {if (username!=null){setUsername(username)}});

        //subscribe to auth changes and call onAuthStateChanged when signed in
        const auth_subscriber = auth().onAuthStateChanged(onAuthStateChanged);

        //sign in
        auth().signInAnonymously()
        .then(() => {
            console.log('User signed in anonymously');
            //Start BLE Scanning

            setGlassesBleState('Scanning...');
            setFlowIOBleState('Scanning...');
            // setPavlokBleState('Scanning...');
            // setWatchBleState('Scanning...');

            if (Platform.OS === 'ios') {
                console.log('starting ble manager state monitoring');
                const temp_sub = bleManager.onStateChange((state) => {
                if (state === "PoweredOn") {
                    scanAndConnect();
                    temp_sub.remove();
                }
                }, true);
            } else {
                scanAndConnect();
            }

            //start RSSI updates
            //startRSSIUpdates();

        }).catch(error => {console.error(error);});

        return function cleanup() {
            //called when component unmounts
            console.log('ON MOUNT DESTROYED!');
            //stopRSSIUpdates();

            //unregister auth listener
            auth_subscriber();
            //logout
            auth().signOut().then(() => {
                console.log('logged out of firebase auth successful');
            }).catch(error => {console.error(error);});

            bleManager.stopDeviceScan();
            disconnectGlasses();
            disconnectFlowIO();
            // disconnectPavlok();
	        // disconnectWatch();	
        }
    }, [])

    function setAndSaveUsername(username){
        AsyncStorage.setItem('username', username);
        setUsername(username);
    }


    function scanAndConnect() {
      console.log('Scan and Connect Called.');
    
      //check paired devices and register bonded pavloks
      console.log('check for bonded device...');
    //   bleManager.connectedDevices([pavlok_ids.MAIN_SERVICE_UUID]).then((d) => {
    //     console.log('CHECK CONNECTED DEVICES');
    //     if (d.length){
    //         for (device of d){
    //             if (device.name!==null){
    //                 registerFoundDevice(device);
    //             }
    //         }
    //     }
    //   });

      //then start scanning if we don't have two full connections
      //give bonding a chance before we check
      setTimeout(() => {
        //   if (!glassesReady() || !pavlokReady() || !watchReady()){
        if (!glassesReady() || !flowIOReady()){
            bleManager.startDeviceScan(null, null, (error, device) => {

                if (error) {
                    setGlassesBleState('ERROR');
                    setFlowIOBleState('ERROR')
                    // setPavlokBleState('ERROR');
                    // setGlassesBleState('ERROR');
                    console.error(error.message);
                    return;
                }
                if (device.name!==null){
                    registerFoundDevice(device);
                }
             });
          }
      }, 1000);
    }

    function registerFoundDevice(device){

        //Log the scanned devices
        localBleState.current.scanned_devices[device.id] = {
            name: device.name,
            rssi: device.rssi,
        };

        console.log(device.name);
        //Found an unconnected watch or glasses!
        // if ((device.name === 'CAPTIVATE' && !glassesReady()) ||
        //     (device.name.includes('Pavlok')  && !pavlokReady()) ||
	    // (['WATCH01', 'DRAMSAY'].includes(device.name) && !watchReady())) {
        if ((device.name === 'CAPTIVATE' && !glassesReady()) || device.name.includes('FlowIO')) {
            try{
                console.log('stopping scan');
                //stopRSSIUpdates();
                bleManager.stopDeviceScan();
            }catch(err) { console.log('stop scan failed: ' + err); }
            //add device to connected_devices, set connecting state indicator,
            //and if it's the second of our two devices stop scanning.

            if(device.name.includes('CAPTIVATE')){
                console.log('got captivate glasses');
                localBleState.current.connected_devices['glasses'] = device;
                setGlassesBleState('Connecting...');
            }else if(device.name.includes('FlowIO')){
                console.log('got flowIO');
                localBleState.current.connected_devices['flowIO'] = device;
                setFlowIOBleState('Connecting...');
            }else{
                
            }

            device
            .connect().then((device) => {
                bleManager.onDeviceDisconnected(device.id, (error, device) => {
                    if (error) {
                        console.log('device disconnect error');
                        console.error(error);
                    }
                        console.log('device disconnect event');

                    if(device.name.includes('CAPTIVATE')){
                        console.log('glasses disconnect callback');
                        setGlassesBleState('Scanning...');
                        disconnectGlasses();
                    }else if(device.name.includes('FlowIO')){
                        console.log('flowIO disconnect callback');
                        setFlowIOBleState('Scanning...');
                        disconnectFlowIO();
                    }else{
                        
                    }       

                    scanAndConnect();
                });

                return device.discoverAllServicesAndCharacteristics();
            })
            .then((device) => {
                console.log("services for " + device.name);
                device
                .services()
                .then((services) => {
                    console.log(services);
                    console.log("characteristics");
                    for (var s in services) {
                      console.log(services[s]);
                      if (services[s].uuid == CAPTIVATES_SERVICE_UUID && device.name == 'CAPTIVATE') {
                        console.log("pushing glasses service");
                        device.characteristicsForService(services[s].uuid)
                        .then((c) => {
                            for (var i in c) {
                            console.log(c[i]);
                            if (c[i].uuid === CAPTIVATES_LED_UUID) {
                                console.log("pushing glasses LED characteristic");
                                localBleState.current.writeCharacteristics['glassesLED'] = c[i];
                            }
                            if (c[i].uuid === CAPTIVATES_RX_UUID) {
                                console.log("registering glasses RX change notification");
			    	            localBleState.current.readSubscriptions['glasses'] = device.monitorCharacteristicForService(c[i].serviceUUID,
								c[i].uuid,
								(error, characteristic) => {
                                if (error) {
                                    setGlassesBleState('ERROR');	
                                    console.error(error.message);
                                    return
                                }
                                updateGlassesData(characteristic.uuid, characteristic.value);
                                });
                            }
                            }
                        }).then(() => {
                          setGlassesBleState('Connected.');
                          if (!flowIOReady()){ scanAndConnect();  }
                          //startRSSIUpdates();
                        }).catch((error) => {console.log(error.message);});
                    } else if (device.name.includes("FlowIO")){
                        console.log("pushing flowIO service");
                        device.characteristicsForService(controlServiceUUID)
                        .then((c) => {
                            for (var i in c) {
                                console.log(c[i]);
                                if (c[i].uuid === chrCommandUUID) {
                                    console.log("pushing flow io control characteristic");
                                    localBleState.current.writeCharacteristics['flowIO'] = c[i];
                                }
                            }
                        }).then(() => {
                          setFlowIOBleState('Connected.');
                          if (!glassesReady()){ scanAndConnect(); }
                          //startRSSIUpdates();
                        }).catch((error) => {console.log(error.message);});
                       //restart scanning if we don't have both devices
                        if (!glassesReady() || !flowIOReady()){ 
                            scanAndConnect();
                        }
                        //restart rssi updates
                        //startRSSIUpdates();
                      } else{

                      }

                    }//end for
                })
                .catch((error) => {
                    setGlassesBleState('ERROR');
                    setFlowIOBleState('ERROR');
                    console.log(error.message);
                });
            })
            .then(() => {
                    console.log('done scan.');
                },
                (error) => {
                    setGlassesBleState('ERROR');
                    setFlowIOBleState('ERROR');
                    console.log(error.message);
                }
            ).catch((error) => {console.log(error.message);});
        }

    }


    //--RENDER--//
    return (
	<>
	<NavigationContainer>
	  <Stack.Navigator>
	    <Stack.Screen
	      name="Home"
	      options={{ title: "Captivate Glass Receiver" }}>
		{(props) => <HomeScreen {...props}
		    glassesStatus={glassesBleState}
            flowIOStatus={flowIOBleState}
		    firebaseSignedIn={userInitialized}
		    username={username}
		    setUsername={setAndSaveUsername}
		    buttonPress1={buttonPress1}	
		    buttonPress2={buttonPress2}	
		    buttonPress3={buttonPress3}	
		/>}
	    </Stack.Screen>

	    <Stack.Screen name="GlassesDataStream" options={{title: "Glasses Data Viewer"}}>
		{(props) => <GlassesDataStream {...props}
		    glassesStatus={glassesBleState}
            flowIOStatus={flowIOBleState}
		    // pavlokStatus={pavlokBleState}
		    // watchStatus={watchBleState}
		    firebaseSignedIn={userInitialized}
		    username={username}
		    setUsername={setAndSaveUsername}
		    sendLEDUpdate={sendLEDUpdate}
		    setStreamDataUI={setStreamDataUI}
		    streamDataUI={streamDataUI}
		    glassesBlinkData={glassesBlinkData}
		    glassesThermalData={glassesThermalData}
		    glassesAccData={glassesAccData}
		    glassesGyroData={glassesGyroData}
		    packetCount={packetCount}
		/>}
	    </Stack.Screen>

        <Stack.Screen name="FlowIOControl" options={{title: "Control flow IO"}}>
		{(props) => <FlowIOControl {...props}
		    glassesStatus={glassesBleState}
            flowIOStatus={flowIOBleState}
		    // pavlokStatus={pavlokBleState}
		    // watchStatus={watchBleState}
		    firebaseSignedIn={userInitialized}
		    username={username}
		    setUsername={setAndSaveUsername}
            sendPort1Update={sendPort1Update}
		/>}
	    </Stack.Screen>

	    <Stack.Screen name="FileSelector" options={{title: "File Selector"}}>
		{(props) => <FileSelector {...props}
		/>}
	    </Stack.Screen>

	    {/* <Stack.Screen name="Credits" component={Credits} /> */}
	  </Stack.Navigator>
	</NavigationContainer>
      </>
  );
  //--END RENDER--//
}

export default App;

