import React from "react";
import { ActivityIndicator, View } from "react-native";

export default (LoadingIndicator = () => (
  <View style={{ flex: 1, justifyContent: "center", alignContent: "center" }}>
    <ActivityIndicator />
  </View>
));
