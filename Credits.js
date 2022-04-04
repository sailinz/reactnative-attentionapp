import React from "react";
import styles from "./Styles";
import "react-native-gesture-handler";

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

export default class Credits extends React.Component {
  render() {
    return (
      <ScrollView>
        <View>
          <Text>
            {"\n"}
            {"\n"}
            {"\n"}
            by David Ramsay {"\n"}
            {"\n"}
            MIT Media Lab Responsive Environments Group{"\n"}
            {"\n"}
            {"\n"}
            {"\n"}
            {"\n"}
            {"\n"}
            {"\n"}
            {"\n"}
            contact dramsay@media.mit.edu
            {"\n"}
            {"\n"}
            {"\n"}
            {"\n"}
            {"\n"}
            {"\n"}
            {"\n"}
            {"\n"}
            {"\n"}
            App Icons made by Freepik from www.flaticon.com.
            {"\n"}
            {"\n"}
            https://www.freepik.com
            {"\n"}
            https://www.flaticon.com
          </Text>
        </View>
      </ScrollView>
    );
  }
}
