import React from "react";
import { Button } from "react-native-elements";
import EventsScreen from "./EventsScreen";
import Icon from "react-native-vector-icons/FontAwesome";
import { Query } from "react-apollo";
import { GET_SELECTED_GROUPID } from "../queries/getSelectedGroupId";
import gql from "graphql-tag";

export default class MainScreen extends React.Component {
  constructor(props) {
    super(props);
  }

  static navigationOptions = ({ navigation }) => {
    return {
      title: "События",
      headerRight: (
        <Button
          onPress={() => navigation.navigate("Options")}
          color="#fff"
          icon={<Icon name="cog" size={32} color="white" />}
        />
      )
    };
  };

  render() {
    return (
      <Query query={gql(GET_SELECTED_GROUPID)}>
        {({ data, loading, error }) => {
          if (error) return null;
          if (loading) return null;

          return (
            <EventsScreen
              {...this.props}
              groupId={data.selectedGroup.groupId}
            />
          );
        }}
      </Query>
    );
  }
}
