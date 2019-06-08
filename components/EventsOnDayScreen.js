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
import { GET_SELECTED_GROUPID } from "./GroupSelectForm";

const GET_EVENTS_ON_DAY = gql`
  query GetEventsOnDay(
    $eventId: Int!
    $groupId: Int
    $startTime: Datetime!
    $endTime: Datetime!
  ) {
    currentPerson {
      nodeId
      personInGroupsByPersonId(condition: { groupId: $groupId }) {
        nodes {
          nodeId
          groupId
          groupOfPersonByGroupId {
            nodeId
            abbrName
            eventMembersByParticipant(condition: { eventId: $eventId }) {
              nodes {
                nodeId
                eventByEventId {
                  nodeId
                  id
                  name
                  timetablesByEventId(
                    filter: {
                      startTime: {
                        greaterThanOrEqualTo: $startTime
                        lessThanOrEqualTo: $endTime
                      }
                    }
                  ) {
                    nodes {
                      nodeId
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
//проверить!
function dateStringToTimeInterval(dateStr) {
  return {
    start: new Date(`${dateStr}T00:00:00`),
    end: new Date(`${dateStr}T23:59:59`)
  };
}

function normalizeData(nodes) {
  const data = [];

  nodes.forEach(group => {
    group.groupOfPersonByGroupId.eventMembersByParticipant.nodes.forEach(
      event => {
        const timetableByEventId = event.eventByEventId.timetablesByEventId;

        //Везде ключи через nodeId!
        timetableByEventId.nodes.forEach(timetable => {
          data.push({
            id:
              event.eventByEventId.nodeId +
              timetable.id +
              group.groupOfPersonByGroupId.nodeId, //nodeId???
            eventId: event.eventByEventId.id,
            timeId: timetable.id,
            eventName: event.eventByEventId.name,
            startTime: timetable.startTime,
            endTime: timetable.endTime,
            groupAbbr: group.groupOfPersonByGroupId.abbrName
          });
        });
      }
    );
  });

  return data;
}

export default class EventsOnDay extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: `События на ${navigation.getParam("date", "...")}`
    };
  };

  render() {
    const dateInterval = dateStringToTimeInterval(
      this.props.navigation.getParam("date", null)
    );
    const eventId = this.props.navigation.getParam("event", null).eventId;

    return (
      <Query query={GET_SELECTED_GROUPID}>
        {({
          data: { selectedGroup },
          loading: groupIdLoading,
          error: groupIdError
        }) => {
          if (groupIdError) return null;
          if (groupIdLoading) return null;

          return (
            <Query
              query={GET_EVENTS_ON_DAY}
              variables={{
                eventId,
                groupId:
                  selectedGroup.groupId !== -1
                    ? selectedGroup.groupId
                    : undefined,
                startTime: dateInterval.start,
                endTime: dateInterval.end
              }}
            >
              {({ data, loading, error }) => {
                if (error) return <Text>Error</Text>;
                if (loading) return <Text>Loading</Text>;

                const listOfDayEvents = normalizeData(
                  data.currentPerson.personInGroupsByPersonId.nodes
                );

                return (
                  <FlatList
                    data={listOfDayEvents}
                    renderItem={({ item }) => (
                      <TouchableHighlight
                        onPress={() =>
                          this.props.navigation.push("EventInfoScreen", {
                            event: {
                              eventId: item.eventId,
                              timeId: item.timeId
                            }
                          })
                        }
                        underlayColor="#FAFAFA"
                        activeOpacity={0.9}
                      >
                        <Text h4>{`${item.eventName} |${item.groupAbbr}| ${
                          item.startTime
                        }-${item.endTime}`}</Text>
                      </TouchableHighlight>
                    )}
                    keyExtractor={item => item.id.toString()}
                  />
                );
              }}
            </Query>
          );
        }}
      </Query>
    );
  }
}
