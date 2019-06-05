import React from "react";
import { StyleSheet, Text, View, Button, FlatList } from "react-native";
import { createStackNavigator } from "react-navigation";

const studentsData = {
  students: [
    {
      id: 1,
      groupID: 1,
      name: "Вася"
    },
    {
      id: 2,
      groupID: 1,
      name: "Петя"
    },
    {
      id: 3,
      groupID: 2,
      name: "Вова"
    },
    {
      id: 4,
      groupID: 2,
      name: "Сашка"
    },
    {
      id: 5,
      groupID: 3,
      name: "Руфус"
    }
  ]
};

export default class DetailsScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: `Студенты ${navigation.getParam("group", "unknow").name} группы`
    };
  };

  getStudentsByGroupID(groupID) {
    const students = [];
    studentsData.students.forEach(item => {
      if (item.groupID == groupID) students.push(item);
    });

    return students;
  }

  render() {
    const group = this.props.navigation.getParam("group", null); //?? null

    return (
      <View style={styles.container}>
        <FlatList
          data={this.getStudentsByGroupID(group.id)}
          renderItem={({ item }) => (
            <Text style={styles.item}>{item.name}</Text>
          )}
          keyExtractor={item => item.id.toString()}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  item: {
    fontSize: 24
  }
});
