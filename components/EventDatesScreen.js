import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-elements";
import { Calendar } from "react-native-calendars";
import { Query } from "react-apollo";
import gql from "graphql-tag";

//Если слишком много дат одного события?
const GET_EVENT_DATES = gql`
  query GetEventDates($eventId: Int!) {
    currentPerson {
      nodeId
      personInGroupsByPersonId {
        nodes {
          nodeId
          groupOfPersonByGroupId {
            nodeId
            abbrName
            eventMembersByParticipant(condition: { eventId: $eventId }) {
              nodes {
                nodeId
                eventByEventId {
                  nodeId
                  name
                  timetablesByEventId {
                    nodes {
                      startTime
                      endTime
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

function normalizeTimetable(timetable) {
  //А если несколько событий на один день?
  const dates = {};

  timetable.forEach(time => {
    //console.log(time.startTime);
    const date = time.startTime.split("T")[0];

    if (!dates[date]) dates[date] = { selected: true, marked: true };
    //dates[date].push(time.date);
  });

  //console.log(timetable);
  return dates;
}

export default class EventDatesScreen extends React.Component {
  static navigationOptions = {
    title: "Даты"
  };

  render() {
    const event = this.props.navigation.getParam("event", null);

    return (
      <Query query={GET_EVENT_DATES} variables={{ eventId: event.eventId }}>
        {({ data, loading, error }) => {
          if (error) return <Text>Error</Text>;
          if (loading) return <Text>Loading</Text>;

          const markedDates = normalizeTimetable(
            data.currentPerson.personInGroupsByPersonId.nodes[0]
              .groupOfPersonByGroupId.eventMembersByParticipant.nodes[0]
              .eventByEventId.timetablesByEventId.nodes
          );

          return (
            <View>
              <Calendar
                onDayPress={day =>
                  this.props.navigation.push("EventsOnDayScreen", {
                    event: {
                      eventId: event.eventId
                    },
                    date: day.dateString
                  })
                }
                style={styles.calendar}
                hideExtraDays
                markedDates={markedDates}
                // markedDates={{
                //   [this.state.selected]: {
                //     selected: true,
                //     disableTouchEvent: true,
                //     selectedDotColor: "orange"
                //   }
                // }}
              />
            </View>
          );
        }}
      </Query>
    );
  }
}

const styles = StyleSheet.create({
  calendar: {
    borderTopWidth: 1,
    paddingTop: 5,
    borderBottomWidth: 1,
    borderColor: "#eee",
    height: 350
  },
  text: {
    textAlign: "center",
    borderColor: "#bbb",
    padding: 10,
    backgroundColor: "#eee"
  },
  container: {
    flex: 1,
    backgroundColor: "gray"
  }
});
