import React from "react";
import {
  ActivityIndicator,
  AsyncStorage,
  StatusBar,
  StyleSheet,
  View
} from "react-native";

export default class AuthLoadingScreen extends React.Component {
  constructor(props) {
    super(props);
    this.auth();
  }

  auth = async () => {
    //Проблема, если токен некорректный!!!!!!!!!!

    //await AsyncStorage.removeItem("userToken");
    //
    //await AsyncStorage.setItem("userToken", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiZGJfYWRtaW4iLCJwZXJzb25faWQiOjE1Mzg3MDA5LCJpYXQiOjE1NTg5NzU0NTAsImV4cCI6MTU1OTA2MTg1MCwiYXVkIjoicG9zdGdyYXBoaWxlIiwiaXNzIjoicG9zdGdyYXBoaWxlIn0.Zl45IBAOCTHanrBLpPojOWaOxjqXRd3ChTNHd5MGVVd");

    const userToken = await AsyncStorage.getItem("userToken");

    //Приостоновочка
    setTimeout(
      () => this.props.navigation.navigate(userToken ? "App" : "Auth"),
      500
    );
  };

  render() {
    return (
      <View
        style={{ flex: 1, justifyContent: "center", alignContent: "center" }}
      >
        <ActivityIndicator />
      </View>
    );
  }
}
