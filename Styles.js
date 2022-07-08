import { StyleSheet } from "react-native";
import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from "react-native/Libraries/NewAppScreen";

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  engine: {
    position: "absolute",
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: "400",
    color: Colors.dark,
  },
  highlight: {
    fontWeight: "700",
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: "600",
    padding: 4,
    paddingRight: 12,
    textAlign: "right",
  },
  description: {
    fontSize: 18,
    textAlign: "center",
    color: "#656565",
    marginTop: 65,
  },
  container: {
    flexDirection: 'column',
  },
  viewContainer: {
    alignItems: "center",
  },
  viewColorContainer: {
    flexDirection: "row",
    // justifyContent: 'center',
    alignItems: "center",
    // height: '100%',
  },
  viewSettingsContainer: {
    flexDirection: "column",
    // justifyContent: 'center',
    alignItems: "center",
    // height: '100%',
    fontSize: 38,
    padding: 4,
  },
  separator: {
    marginVertical: 8,
    borderBottomColor: '#737373',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  bigbuttonStyle: {
    borderWidth: 0.5,
    borderColor: 'grey',
    backgroundColor: '#f1edff',
    height: '25%',
    aspectRatio:1,
    borderRadius: 15,
    margin: 25,
    padding:15
  },
  bigbuttonStyleWide: {
    borderWidth: 0.5,
    borderColor: 'grey',
    backgroundColor: '#f1edff',
    height: '75%',
    width: '85%',
    borderRadius: 15,
    textAlign: 'center',
    alignItems: 'center',
    margin: 15,
    padding:5
  },
  bigbuttonStyleLarge: {
    borderWidth: 0.5,
    borderColor: 'grey',
    backgroundColor: '#f1edff',
    height: '85%',
    aspectRatio:1,
    borderRadius: 15,
    margin: 25,
    padding:15
  },
  smallbuttonStyle: {
    borderWidth: 0.5,
    borderColor: 'grey',
    backgroundColor: '#f1edff',
    height: '80%',
    aspectRatio:1,
    borderRadius: 5,
    margin: 20,
    marginLeft:80,
    padding:5
  }
});

export default styles;
