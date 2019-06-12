import React from "react";
import { StyleSheet, View } from "react-native";
import {
  Input,
  Header,
  Text,
  Button,
  SocialIcon,
  Divider
} from "react-native-elements";
import { Query } from "react-apollo";
import { GET_EVENT_DETAILS } from "./queries";

const EventDescription = ({ eventId, timetableId }) => (
  <Query query={GET_EVENT_DETAILS} variables={{ eventId, timetableId }}>
    {({ data, loading, error }) => {
      if (error) return <Text>Error</Text>;
      if (loading) return <Text>Loading</Text>;

      const event = data.eventById;

      return (
        <View>
          <Text h3 style={{ textAlign: "center" }}>
            {event.name}
          </Text>
          <Divider style={{ margin: 6 }} />
          <Text h4 style={{ margin: 5 }}>
            Начало в:
          </Text>
          <Text h4 style={{ margin: 5 }}>
            {event.timetablesByEventId.nodes[0].startTime}
          </Text>
          <Text h4 style={{ margin: 5 }}>
            Конец в:
          </Text>
          <Text h4 style={{ margin: 5 }}>
            {event.timetablesByEventId.nodes[0].endTime}
          </Text>
          <Text h4 style={{ margin: 5 }}>
            Описание:
          </Text>
          <Text h4 style={{ margin: 5 }}>
            {"Здесь может быть ваше описание"}
          </Text>
          <Text h4 style={{ margin: 5 }}>
            Место:
          </Text>
          <Text h4 style={{ margin: 5 }}>
            {event.timetablesByEventId.nodes[0].placeByPlaceId}
          </Text>
        </View>
      );
    }}
  </Query>
);

export default class EventInfoScreen extends React.Component {
  static navigationOptions = {
    title: "Событие"
  };

  render() {
    const { navigation } = this.props;
    const event = navigation.getParam("event", null);

    if (event === null) return null; //Ошибка

    return (
      <View>
        <EventDescription eventId={event.eventId} timetableId={event.timeId} />
      </View>
    );
  }
}
