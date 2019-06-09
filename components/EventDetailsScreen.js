import React from "react";
import { createBottomTabNavigator, createAppContainer } from "react-navigation";
import Ionicons from "react-native-vector-icons/Ionicons";
import EventDatesScreen from "./EventDatesScreen"; //Можно убрать Screen из названия?
import EventInfoScreen from "./EventInfoScreen";

const TabNavigator = createBottomTabNavigator(
  {
    EventInfoScreen: EventInfoScreen,
    EventDatesScreen: EventDatesScreen
  },
  {
    defaultNavigationOptions: ({ navigation }) => ({
      //Настроить!!!!!!
      tabBarIcon: ({ focused, horizontal, tintColor }) => {
        const { routeName } = navigation.state;
        let IconComponent = Ionicons;
        let iconName;
        if (routeName === "EventInfoScreen") {
          iconName = `ios-information-circle${focused ? "" : "-outline"}`;
          // Sometimes we want to add badges to some icons.
          // You can check the implementation below.
          //IconComponent = HomeIconWithBadge;
        } else if (routeName === "EventDatesScreen") {
          iconName = `ios-calendar`;
        }

        // You can return any component that you like here!
        return <IconComponent name={iconName} size={25} color={tintColor} />;
      }
    }),
    tabBarOptions: {
      activeTintColor: "tomato",
      inactiveTintColor: "gray",
      labelStyle: { fontSize: 15 }
    }
  }
);

export default createAppContainer(TabNavigator);
