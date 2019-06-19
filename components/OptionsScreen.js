import React from "react";
import { StyleSheet, View } from "react-native";
import { Text, Button, Divider } from "react-native-elements";
import GroupSelectForm from "./GroupSelectForm";
import { logOut } from "./managmentFunctions";
import { ApolloConsumer } from "react-apollo";

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
      <ApolloConsumer>
        {client => (
          <View style={styles.container}>
            <Text h4>Фильтр по группам: </Text>
            <GroupSelectForm />
            <Divider style={{ height: 2, margin: 10 }} />
            <View style={{ flex: 1, justifyContent: "flex-end" }}>
              <Button
                title="Log out"
                buttonStyle={{ backgroundColor: "red" }}
                onPress={() =>
                  logOut()
                    .then(() => {
                      client.stop(); //Чтобы не было ошибок, если выйти при выполнении запросов
                      return client.clearStore();
                    })
                    .then(() => this.props.navigation.navigate("Auth"))
                }
              />
            </View>
          </View>
        )}
      </ApolloConsumer>
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
