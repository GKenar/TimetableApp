import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Text, Divider, Button } from "react-native-elements";
import { Query } from "react-apollo";
import { GET_EVENT_DETAILS } from "../queries/getEventDetails";
import gql from "graphql-tag";
import LoadingIndicator from "./LoadingIndicator";
import ErrorMessage from "./ErrorMessage";
import { dateToYMD, dateToHMS } from "./dateFunctions";

const EventDescription = ({ eventId, timetableId }) => (
  <Query query={gql(GET_EVENT_DETAILS)} variables={{ eventId, timetableId }}>
    {({ data, loading, error, refetch }) => {
      if (error)
        return (
          <ErrorMessage
            errorObject={error}
            message="Ошибка при выполнении запроса на сервер"
          >
            <Button title="Обновить" onPress={() => refetch()} />
          </ErrorMessage>
        );
      if (loading) return <LoadingIndicator />;

      const event = data.eventById;
      const eventStartDate = new Date(
        event.timetablesByEventId.nodes[0].startTime + "Z"
      );
      const eventEndDate = new Date(
        event.timetablesByEventId.nodes[0].endTime + "Z"
      );
      return (
        <ScrollView style={{ paddingHorizontal: 20 }}>
          <Text h3 style={{ textAlign: "center" }}>
            {event.name}
          </Text>
          <Divider style={{ margin: 6 }} />
          <Text style={styles.fieldName}>
            Дата: {dateToYMD(eventStartDate)}
          </Text>
          <Text style={styles.fieldName}>
            Начало в: {dateToHMS(eventStartDate)}
          </Text>
          <Text style={styles.fieldName}>
            Конец в: {dateToHMS(eventEndDate)}
          </Text>
          <Text style={styles.fieldName}>Место проведения:</Text>
          <Text style={styles.fieldValue}>
            {event.timetablesByEventId.nodes[0].placeByPlaceId}
          </Text>
          <Text style={styles.fieldName}>Описание:</Text>
          <Text style={styles.fieldValue}>{"Здесь описание события"}</Text>
        </ScrollView>
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
      <EventDescription eventId={event.eventId} timetableId={event.timeId} />
    );
  }
}

const styles = StyleSheet.create({
  fieldName: {
    margin: 5,
    fontWeight: "bold",
    fontSize: 22
  },
  fieldValue: {
    margin: 5,
    fontSize: 20
  }
});
