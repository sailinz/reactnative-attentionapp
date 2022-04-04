/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */


// privacy and thermal comfort, robust across activities, dynamic
//
//

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

import HomeScreen from "./HomeScreen";
import GlassesCalibrate from "./GlassesTests/glassesCalibrate";
import GlassesTest from "./GlassesTests/glassesTest";
import PavlokCalibrate from "./PavlokTests/pavlokCalibrate";
import PavlokTest from "./PavlokTests/pavlokTest";
import Credits from "./Credits";

import styles from "./Styles";

import { BleManager } from "react-native-ble-plx";

import AsyncStorage from '@react-native-async-storage/async-storage'

const optMap = {
    1: 'very low',
    2: 'low',
    3: 'average',
    4: 'high',
    5: 'very high'
};

const emoMap = {
    1: 'very negative',
    2: 'negative',
    3: 'nuetral',
    4: 'positive',
    5: 'very positive'
};

const pavlok_ids = {
    BATTERY_SERVICE_UUID: "0000180f-0000-1000-8000-00805f9b34fb",
    BATTERY_CHAR_UUID: "00002a19-0000-1000-8000-00805f9b34fb",
    MAIN_SERVICE_UUID: "156e1000-a300-4fea-897b-86f698d74461",
    MAIN_VIBRATE_CHAR_UUID: "00001001-0000-1000-8000-00805f9b34fb",
    MAIN_BEEP_CHAR_UUID: "00001002-0000-1000-8000-00805f9b34fb",
    MAIN_ZAP_CHAR_UUID: "00001003-0000-1000-8000-00805f9b34fb",
    MAIN_LED_CHAR_UUID: "00001004-0000-1000-8000-00805f9b34fb"
}

const CAPTIVATES_SERVICE_UUID = "0000fe80-8e22-4541-9d4c-21edae82ed19";
const CAPTIVATES_LED_UUID = "0000fe84-8e22-4541-9d4c-21edae82ed19";

//const packetPadding = capLogPacket.LOG_PACKET_SIZE * 2;
const Stack = createStackNavigator();
const bleManager = new BleManager();
//const NUM_TO_PLOT = 100;

//var conditions_packet_cache = {timestamp: null, temp:null, humd:null, lux:null, wlux:null};

//const conditionsCollection = firestore().collection('conditions');
//const eventsCollection = firestore().collection('events');
const dataCollection = firestore().collection('data');

function App() {

    console.log('App CREATED');
    //-- CREATE APP STATE --//
    //user id
    const [userInitialized, setUserInitialized] = useState(false);
    const [user, setUser] = useState();
    const [username, setUsername] = useState();
    const [dataArray, setDataArray] = useState([]);

    const firebaseAuthDebounceTimer = useRef(null);

    //db connections
    const [firestoreInitialized, setFirestoreInitialized] = useState(false);

    //ble state
    const [glassesBleState, setGlassesBleState] = useState('');
    const [pavlokBleState, setPavlokBleState] = useState('');
    const [rssiVals, setRssiVals] = useState([0,0]);
    const [pavlokBattery, setPavlokBattery] = useState(0);
    const [pavlokMinStrength, setPavlokMinStrength] = useState(35);
    const [pavlokTimeOn, setPavlokTimeOn] = useState(5);

    //-- NON-REACT STATE --//

    //state in React is only state THAT HAS A VIEW EFFECT
    //other state can just be local variables etc.  State/props
    //are tracked by React to decide when/how to re-render components
    //if it doesn't have a view effect it doesn't need to be tracked
    const localBleState = useRef({
        scanned_devices: {},
        connected_devices: {
            glasses: null,
            pavlok: null
        },
        writeCharacteristics: {
            glassesLED: null,
            pavlokVIB: null
        },
        readSubscriptions: {
            pavlokBAT: null
        },
    });

    function updatePavlokBattery(key, value) {
        var decval = parseInt(base64ToHex(value), 16);
        console.log('update ' + key + ' : ' + decval)
        setPavlokBattery(decval);
    }

    function sendVibrate(intensity){
        console.log('send vibrate ' + intensity);
        var hexString = decimalToHex(129) + "0C" + decimalToHex(intensity) +
                        decimalToHex(pavlokTimeOn) + decimalToHex(36);
        console.log(hexString);
        localBleState.current.writeCharacteristics.pavlokVIB.writeWithResponse(hexToBase64(hexString), null).catch((error) => {
            console.log('caught error');
            setPavlokBleState('ERROR');
            scanAndConnect();
        });

    }

    function sendLEDUpdate(ledArray){
      localBleState.current.writeCharacteristics.glassesLED.writeWithoutResponse(hexToBase64(bytesToHex(ledArray.slice(0))), null);
    }


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
    const intervalRSSI = useRef(null);

    //--DERIVED STATE--//
    function glassesReady(){
        return (localBleState.current.writeCharacteristics.glassesLED!=null);
    }

    function pavlokReady(){
        return (localBleState.current.writeCharacteristics.pavlokVIB!=null);
    }
    //--DONE WITH STATE--//


    //--RSSI--//
    //this has been registered with an interval in localBleState.current.intervalRSSI
    //it will run every 3 sec and if there are connected devices it will
    //update their respective RSSI values
    function updateRSSI(){
        if (localBleState.current.connected_devices['glasses'] != null){
            localBleState.current.connected_devices['glasses'].readRSSI()
              .then((updatedDevice) => {
                setRssiVals((prev) => [updatedDevice.rssi, prev[1]]);
            return true;
            })
            .catch((err) => console.log("There was an error:" + err));
        }
        if (localBleState.current.connected_devices['pavlok'] != null){
            localBleState.current.connected_devices['pavlok'].readRSSI()
              .then((updatedDevice) => {
                setRssiVals((prev) => [prev[0], updatedDevice.rssi]);
            return true;
            })
            .catch((err) => console.log("There was an error:" + err));
        }
    }

    function startRSSIUpdates(){ intervalRSSI.current = setInterval(updateRSSI, 3000)}
    function stopRSSIUpdates(){ clearInterval(intervalRSSI.current); }
    //--END RSSI--//

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

    function disconnectPavlok(){
        console.log('disconnecting Pavlok');
        if (localBleState.current.connected_devices['pavlok'] != null){
            try{
                localBleState.current.connected_devices['pavlok'].cancelConnection();
                localBleState.current.connected_devices['pavlok'] = null;
            }catch(err){
                console.log('cancel pavlok connection failed');
            }
        }
        if (localBleState.current.readSubscriptions['pavlokBAT'] !== null) {
            try{
                localBleState.current.readSubscriptions['pavlokBAT'].remove();
                localBleState.current.readSubscriptions['pavlokBAT'] = null;
            }catch(err){
                console.log('cancel pavlok connection failed');
            }
        }

        localBleState.current.writeCharacteristics['pavlokVIB'] = null;
    }


    useEffect(() => {
        //this will only run on component mount because of empty array
        //passed as second argument to useEffect

        console.log('ON MOUNT CALLED!');

        AsyncStorage.getItem('username').then((username) => {if (username!=null){setUsername(username)}});
        AsyncStorage.getItem('minstrength').then((minstrength) => {if (minstrength!=null){setPavlokMinStrength(parseInt(minstrength))}});
        AsyncStorage.getItem('timeon').then((timeon) => {if (timeon!=null){setPavlokTimeOn(parseInt(timeon))}});

        //subscribe to auth changes and call onAuthStateChanged when signed in
        const auth_subscriber = auth().onAuthStateChanged(onAuthStateChanged);

        //sign in
        auth().signInAnonymously()
        .then(() => {
            console.log('User signed in anonymously');
            //Start BLE Scanning

            setGlassesBleState('Scanning...');
            setPavlokBleState('Scanning...');

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
            stopRSSIUpdates();

            //unregister auth listener
            auth_subscriber();
            //logout
            auth().signOut().then(() => {
                console.log('logged out of firebase auth successful');
            }).catch(error => {console.error(error);});

            bleManager.stopDeviceScan();
            disconnectGlasses();
            disconnectPavlok();
        }
    }, [])

    function setAndSaveUsername(username){
        AsyncStorage.setItem('username', username);
        setUsername(username);
    }

    function setAndSavePavlokMinStrength(minstrength){
        AsyncStorage.setItem('minstrength', String(minstrength));
        setPavlokMinStrength(minstrength);
    }

    function setAndSavePavlokTimeOn(timeon){
        AsyncStorage.setItem('timeon', String(timeon));
        setPavlokTimeOn(timeon);
    }

    function scanAndConnect() {
      console.log('Scan and Connect Called.');
    
      //check paired devices and register bonded pavloks
      console.log('check for bonded device...');
      bleManager.connectedDevices([pavlok_ids.MAIN_SERVICE_UUID]).then((d) => {
        console.log('CHECK CONNECTED DEVICES');
        if (d.length){
            for (device of d){
                if (device.name!==null){
                    registerFoundDevice(device);
                }
            }
        }
      });

      //then start scanning if we don't have two full connections
      //give bonding a chance before we check
      setTimeout(() => {
          if (!glassesReady() || !pavlokReady()){
            bleManager.startDeviceScan(null, null, (error, device) => {

                if (error) {
                    setGlassesBleState('ERROR');
                    setPavlokBleState('ERROR');
                    console.log(error.message);
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
        if ((device.name === 'CAPTIVATE' && !glassesReady()) ||
            (device.name.includes('Pavlok')  && !pavlokReady())) {
            try{
                console.log('stopping scan');
                stopRSSIUpdates();
                bleManager.stopDeviceScan();
            }catch(err) { console.log('stop scan failed: ' + err); }
            //add device to connected_devices, set connecting state indicator,
            //and if it's the second of our two devices stop scanning.
            switch(device.name){
                case 'CAPTIVATE':
                    console.log('got captivate glasses');
                    localBleState.current.connected_devices['glasses'] = device;
                    setGlassesBleState('Connecting...');
                    break;
                default:
                    console.log('got pavlok');
                    localBleState.current.connected_devices['pavlok'] = device;
                    setPavlokBleState('Connecting...');
                    break;
            }

            device
            .connect().then((device) => {
                bleManager.onDeviceDisconnected(device.id, (error, device) => {
                    if (error) {
                        console.log('device disconnect error');
                        console.log(error);
                    }
                        console.log('device disconnect event');

                    switch(device.name){
                        case 'CAPTIVATE':
                            console.log('glasses disconnect callback');
                            setGlassesBleState('Scanning...');
                            disconnectGlasses();
                            break;
                        default:
                            console.log('pavlok disconnect callback');
                            setPavlokBleState('Scanning...');
                            disconnectPavlok();
                            break;
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
                            }
                        }).then(() => {
                          setGlassesBleState('Connected.');
                          if (!pavlokReady()){ scanAndConnect(); }
                          startRSSIUpdates();
                        }).catch((error) => {console.log(error.message);});
                      } else if (services[s].uuid == pavlok_ids.BATTERY_SERVICE_UUID && device.name.includes('Pavlok')){
                        console.log("pushing pavlok battery service");
                        device.characteristicsForService(services[s].uuid)
                        .then((c)=> {
                            for (var i in c){
                                console.log(c[i]);
                                if (c[i].uuid == pavlok_ids.BATTERY_CHAR_UUID){
                                    console.log('registering battery indicator change notification');
                                    localBleState.current.readSubscriptions['pavlokBAT'] = device.monitorCharacteristicForService(c[i].serviceUUID,
                                                                        c[i].uuid,
                                                                        (error, characteristic) => {
                                        if (error) {
                                        console.log(error.message)
                                        return
                                        }
                                        updatePavlokBattery(characteristic.uuid, characteristic.value);
                                    });
                                }
                            }
                        }).catch((error) => {console.log(error.message);});
                      } else if (services[s].uuid == pavlok_ids.MAIN_SERVICE_UUID && device.name.includes('Pavlok')){
                        console.log("pushing pavlok main service");
                        device.characteristicsForService(services[s].uuid)
                        .then((c)=> {
                            for (var i in c){
                                console.log(c[i]);
                                 if (c[i].uuid === pavlok_ids.MAIN_VIBRATE_CHAR_UUID){
                                            console.log('found vibrate characteristic');
                                            localBleState.current.writeCharacteristics['pavlokVIB'] = c[i];
                                        }
                            }
                        }).then(() => {
                            setPavlokBleState('Connected.');
                            if (!glassesReady()){ scanAndConnect(); }
                            startRSSIUpdates();
                        }).catch((error) => {console.log(error.message);});
                      }

                    }//end for
                })
                .catch((error) => {
                    setGlassesBleState('ERROR');
                    setPavlokBleState('ERROR');
                    console.log(error.message);
                });
            })
            .then(() => {
                    console.log('done scan.');
                },
                (error) => {
                    setGlassesBleState('ERROR');
                    setPavlokBleState('ERROR');
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
              options={{ title: "Captivate Attention Tests" }}>
                {(props) => <HomeScreen {...props}
                    glassesStatus={glassesBleState}
                    pavlokStatus={pavlokBleState}
                    firebaseSignedIn={userInitialized}
                    username={username}
                    setUsername={setAndSaveUsername}
                />}
            </Stack.Screen>

            <Stack.Screen name="GlassesCalibrate" options={{title: "Glasses Calibrate"}}>
                {(props) => <GlassesCalibrate {...props}
                    glassesStatus={glassesBleState}
                    pavlokStatus={pavlokBleState}
                    firebaseSignedIn={userInitialized}
                    username={username}
                    setUsername={setAndSaveUsername}

                    sendLEDUpdate={sendLEDUpdate}
                    addData={addData}
                    dataArray={dataArray}
                />}
            </Stack.Screen>

            <Stack.Screen name="GlassesTest" options={{title: "Glasses Test"}}>
                {(props) => <GlassesTest {...props}
                    glassesStatus={glassesBleState}
                    pavlokStatus={pavlokBleState}
                    firebaseSignedIn={userInitialized}
                    username={username}
                    setUsername={setAndSaveUsername}

                    sendLEDUpdate={sendLEDUpdate}
                    addData={addData}
                    dataArray={dataArray}
                />}
            </Stack.Screen>

            <Stack.Screen name="PavlokCalibrate" options={{title: "Pavlok Calibrate"}}>
                {(props) => <PavlokCalibrate {...props}
                    glassesStatus={glassesBleState}
                    pavlokStatus={pavlokBleState}
                    firebaseSignedIn={userInitialized}
                    username={username}
                    setUsername={setAndSaveUsername}

                    pavlokTimeOn={pavlokTimeOn}
                    setPavlokTimeOn={setAndSavePavlokTimeOn}
                    pavlokMinStrength={pavlokMinStrength}
                    setPavlokMinStrength={setAndSavePavlokMinStrength}
                    pavlokBattery={pavlokBattery}
                    sendVibrate={sendVibrate}
                    addData={addData}
                    dataArray={dataArray}
                />}
            </Stack.Screen>

            <Stack.Screen name="PavlokTest" options={{title: "Pavlok Test"}}>
                {(props) => <PavlokTest {...props}
                    glassesStatus={glassesBleState}
                    pavlokStatus={pavlokBleState}
                    firebaseSignedIn={userInitialized}
                    username={username}
                    setUsername={setAndSaveUsername}

                    pavlokTimeOn={pavlokTimeOn}
                    setPavlokTimeOn={setAndSavePavlokTimeOn}
                    pavlokMinStrength={pavlokMinStrength}
                    setPavlokMinStrength={setAndSavePavlokMinStrength}
                    pavlokBattery={pavlokBattery}
                    sendVibrate={sendVibrate}
                    addData={addData}
                    dataArray={dataArray}
                />}
            </Stack.Screen>


            <Stack.Screen name="Credits" component={Credits} />
          </Stack.Navigator>
        </NavigationContainer>
      </>
  );
  //--END RENDER--//
}

export default App;

