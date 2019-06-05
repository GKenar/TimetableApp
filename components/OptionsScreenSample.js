import React from "react";
import { StyleSheet, View } from "react-native";
import { createStackNavigator } from "react-navigation";
import {
  Input,
  Header,
  Text,
  Button,
  Slider,
  Divider,
  Icon,
  ButtonGroup,
  CheckBox
} from "react-native-elements";

export default class OptionsScreen extends React.Component {
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
          Slider
        </Text>
        <Divider style={{ height: 2, margin: 10 }} />
        <Slider minimumValue={1} maximumValue={10} value={1} />

        <Text h3 style={{ textAlign: "center" }}>
          Buttons
        </Text>
        <Divider style={{ height: 2, margin: 10 }} />
        <Button
          title="Simple red button"
          buttonStyle={{ backgroundColor: "red" }}
          onPress={() => console.log("Pressed!")}
        />
        <Button
          title="Button with icon"
          icon={
            <Icon
              name={this.state.checkBox1 ? "grid-on" : "grid-off"}
              size={34}
              color="white"
            />
          }
          buttonStyle={{ backgroundColor: "blue" }}
          onPress={() =>
            this.setState(prev => ({ checkBox1: !prev.checkBox1 }))
          }
        />
        <ButtonGroup
          buttons={["SIMPLE", "BUTTON", "GROUP"]}
          selectedIndex={this.state.selectedIndex}
          onPress={selectedIndex => {
            this.setState({ selectedIndex });

            console.log("Selected: " + selectedIndex);
          }}
          containerStyle={{ marginBottom: 20 }}
        />

        <Text h3 style={{ textAlign: "center" }}>
          CheckBoxs
        </Text>
        <Divider style={{ height: 2, margin: 10 }} />
        <CheckBox
          center
          title="Click Here to Remove This Item"
          iconRight
          iconType="material"
          checkedIcon="clear"
          uncheckedIcon="add"
          checkedColor="red"
          checked={this.state.checkBox2}
          onPress={() => this.setState({ checkBox2: !this.state.checkBox2 })}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "stretch",
    justifyContent: "center",
    padding: 10
  }
});
