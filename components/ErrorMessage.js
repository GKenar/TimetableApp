import React from "react";
import { View } from "react-native";
import { Text } from "react-native-elements";

export default props => {
  const { errorObject, message, children } = props;

  console.log(errorObject);
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "stretch" }}>
      <Text h4>{message}</Text>
      {children}
    </View>
  );
};
