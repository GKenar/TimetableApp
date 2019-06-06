import React from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  createStackNavigator,
  createAppContainer,
  createSwitchNavigator,
  createDrawerNavigator
} from "react-navigation";
import ApolloClient from "apollo-boost";
import { ApolloProvider } from "react-apollo";
import { AsyncStorage } from "react-native";
import { InMemoryCache } from "apollo-cache-inmemory";
import { persistCache } from "apollo-cache-persist";
import GroupsScreen from "./components/GroupsScreen";
import GroupDetailsScreen from "./components/GroupDetailsScreen";
import MainScreen from "./components/MainScreen";
import LoginScreen from "./components/LoginScreen";
import OptionsScreen from "./components/OptionsScreen";
import TestScreen from "./components/TestScreen";
import EventInfoScreen from "./components/EventInfoScreen";
import EventDetailsScreen from "./components/EventDetailsScreen";
import EventsOnDay from "./components/EventsOnDayScreen";
import AuthLoadingScreen from "./components/AuthLoadingScreen";
//Вынести запрос
import { GET_SELECTED_GROUPID } from "./components/GroupSelectForm";

const cache = new InMemoryCache(); //???

// await before instantiating ApolloClient, else queries might run before the cache is persisted
//Тут раскоментить, чтобы использовать persist cache
persistCache({
  ///????????????? await?
  cache,
  storage: AsyncStorage
});

// Continue setting up Apollo as usual.

const client = new ApolloClient({
  //cache,
  uri: "http://ksa.spsu.ru/graphql",
  // headers: {
  //   Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiZGJfYWRtaW4iLCJwZXJzb25faWQiOjE1Mzg3MDA5LCJpYXQiOjE1NTg5NzU0NTAsImV4cCI6MTU1OTA2MTg1MCwiYXVkIjoicG9zdGdyYXBoaWxlIiwiaXNzIjoicG9zdGdyYXBoaWxlIn0.Zl45IBAOCTHanrBLpPojOWaOxjqXRd3ChTNHd5MGVVs"
  // }
  request: async operation => {
    const token = await AsyncStorage.getItem("userToken");
    console.log("token: " + token);
    if (token)
      operation.setContext({
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  },
  clientState: {
    defaults: {
      selectedGroup: {
        __typename: "selectedGroup",
        groupId: -1
      }
    },
    resolvers: {
      Mutation: {
        setSelectedGroupId: (_, variables, { cache }) => {
          const data = {
            selectedGroup: {
              __typename: "selectedGroup",
              groupId: variables.groupId
            }
          };
          cache.writeData({ data });

          return null;
        }
      }
    }
  }
});

const AppNavigator = createStackNavigator(
  {
    Main: MainScreen,
    EventInfoScreen: EventInfoScreen,
    EventDetailsScreen: EventDetailsScreen,
    Options: OptionsScreen,
    TestScreen: TestScreen,
    GroupsScreen: GroupsScreen,
    GroupDetailsScreen: GroupDetailsScreen,
    //TEST!
    EventsOnDayScreen: EventsOnDay
  },
  {
    initialRouteName: "Main",
    defaultNavigationOptions: {
      headerStyle: {
        backgroundColor: "#006AFF"
      },
      headerTintColor: "#fff",
      headerTitleStyle: {
        fontWeight: "bold",
        textAlign: "center" //?
      }
    }
  }
);

// const MyDrawerNavigator = createDrawerNavigator({
//   Home: {
//     screen: AppNavigator
//   }
// });

const RootNavigator = createSwitchNavigator(
  {
    AuthLoading: AuthLoadingScreen,
    App: AppNavigator,
    Auth: LoginScreen
  },
  {
    initialRouteName: "AuthLoading"
  }
);

const AppContainer = createAppContainer(RootNavigator);

export default class App extends React.Component {
  render() {
    return (
      <ApolloProvider client={client}>
        <AppContainer />
      </ApolloProvider>
    );
    //return <LoginScreen />;
    //return <Notifier />;
    //return <EventsScreen />;
    //return <OptionsScreen/>;
    //return <TestScreen/>;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center"
  }
});
