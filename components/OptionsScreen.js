import React from "react";
import { AsyncStorage } from "react-native";
import { StyleSheet, View } from "react-native";
import { Text, Button, Divider } from "react-native-elements";
import GroupSelectForm from "./GroupSelectForm";

export default class OptionsScreen extends React.Component {
  static navigationOptions = {
    title: "Настройки"
  };

  constructor(props) {
    super(props);

    this.state = {
      checkBox1: false,
      checkBox2: false,
      selectedIndex: 0
    };
  }

  render() {
    return (
      <View style={styles.container}>
        <Text h3 style={{ textAlign: "center" }}>
          Настройки
        </Text>
        <Divider style={{ height: 2, margin: 10 }} />
        <Button
          title="Log out"
          buttonStyle={{ backgroundColor: "red" }}
          //Нужно очищать кэш
          onPress={() =>
            AsyncStorage.removeItem("userToken").then(() =>
              this.props.navigation.navigate("Auth")
            )
          }
        />
        {/* Вынести в отдельный модуль взаимодействие с AsyncStore */}
        <GroupSelectForm />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "stretch",
    justifyContent: "flex-start",
    padding: 10
  }
});
