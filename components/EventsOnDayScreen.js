import React from "react";
import { StyleSheet, View, FlatList, TouchableHighlight } from "react-native";
import {
  Input,
  Header,
  Text,
  Button,
  SocialIcon,
  Divider
} from "react-native-elements";
import { Calendar } from "react-native-calendars";
import ApolloClient from "apollo-boost";
import { ApolloProvider, Query, ApolloConsumer, Mutation } from "react-apollo";
import gql from "graphql-tag";

//Дата в строке??
const GET_EVENTS_ON_DAY = gql`
  query GetEventsOnDay(
    $eventId: Int!
    $startTime: Datetime!
    $endTime: Datetime!
  ) {
    currentPerson {
      personInGroupsByPersonId {
        nodes {
          groupOfPersonByGroupId {
            eventMembersByParticipant(condition: { eventId: $eventId }) {
              nodes {
                eventByEventId {
                  id
                  name
                  nodeId
                  timetablesByEventId(
                    filter: {
                      startTime: {
                        greaterThanOrEqualTo: $startTime
                        lessThan: $endTime
                      }
                    }
                  ) {
                    nodes {
                      id
                      startTime
                      endTime
                      placeId
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

//Мб эффективнее создавать Date?
function dateStringToTimeInterval(dateStr) {
  return {
    start: new Date(`${dateStr}T00:00:00`),
    end: new Date(`${dateStr}T23:59:59`)
  };
}

function normalizeData(nodes) {
  const data = [];

  nodes.forEach(event => {
    const timetableByEventId = event.eventByEventId.timetablesByEventId;

    timetableByEventId.nodes.forEach(timetable => {
      data.push({
        eventId: event.eventByEventId.id,
        timeId: timetable.id,
        eventName: event.eventByEventId.name,
        startTime: timetable.startTime,
        endTime: timetable.endTime
      });
    });
  });

  return data;
}

export default class EventsOnDay extends React.Component {
  static navigationOptions = {
    title: "События на ..."
  };

  render() {
    const dateInterval = dateStringToTimeInterval(
      this.props.navigation.getParam("date", null)
    );
    const eventId = this.props.navigation.getParam("event", null).eventId;

    return (
      <Query
        query={GET_EVENTS_ON_DAY}
        variables={{
          eventId,
          startTime: dateInterval.start,
          endTime: dateInterval.end
        }}
      >
        {({ data, loading, error }) => {
          console.log(error);
          if (error) return <Text>Error</Text>;
          if (loading) return <Text>Loading</Text>;

          const listOfDayEvents = normalizeData(
            data.currentPerson.personInGroupsByPersonId.nodes[0]
              .groupOfPersonByGroupId.eventMembersByParticipant.nodes
          );

          console.log(listOfDayEvents);

          return (
            <FlatList
              data={listOfDayEvents}
              renderItem={({ item }) => (
                <TouchableHighlight
                  onPress={() =>
                    this.props.navigation.push("EventInfoScreen", {
                      event: { eventId: item.eventId, timeId: item.timeId }
                    })
                  }
                  underlayColor="#FAFAFA"
                  activeOpacity={0.9}
                >
                  <Text h3>{item.eventName}</Text>
                </TouchableHighlight>
              )}
              //eventId повторяется ????
              keyExtractor={item => item.eventId.toString()}
            />
          );
        }}
      </Query>
    );
  }
}