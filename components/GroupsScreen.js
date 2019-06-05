import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  FlatList,
  TouchableHighlight
} from "react-native";
import { createStackNavigator } from "react-navigation";

const groupsData = {
  groups: [
    {
      id: 1,
      name: 403,
      speciality: "ПМ и И"
    },
    {
      id: 2,
      name: 401,
      speciality: "spec. holder"
    },
    {
      id: 3,
      name: 410,
      speciality: "spec. holder"
    }
  ]
};

/*
<Button
    title="Go to details"
    onPress={() => this.props.navigation.navigate('Details')}
/>
<Text style={{ fontSize: 24, textAlign: "center", margin: 5 }}>Список групп:</Text>
*/

export default class GroupsScreen extends React.Component {
  static navigationOptions = {
    title: "Список групп"
  };

  render() {
    return (
      <View style={styles.container}>
        <FlatList
          data={groupsData.groups}
          renderItem={({ item }) => {
            return (
              <TouchableHighlight
                onPress={() =>
                  this.props.navigation.navigate("GroupDetailsScreen", {
                    group: item
                  })
                }
                underlayColor="#009FBF"
              >
                <View style={styles.itemContainer}>
                  <Text style={styles.item}>{`${item.name} | ${
                    item.speciality
                  }`}</Text>
                </View>
              </TouchableHighlight>
            );
          }}
          keyExtractor={item => item.id.toString()}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    alignItems: "stretch",
    justifyContent: "center"
  },
  itemContainer: {
    flex: 1,
    marginTop: 5
  },
  item: {
    padding: 10,
    fontSize: 32,
    marginLeft: 10,
    marginRight: 10,
    textAlign: "center",
    color: "black",
    borderBottomColor: "#B6C0C0",
    borderBottomWidth: 2
  }
});
