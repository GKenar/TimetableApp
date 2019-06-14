import React from "react";
import { StyleSheet, ScrollView } from "react-native";
import { Button } from "react-native-elements";
import { Calendar } from "react-native-calendars";
import { Query } from "react-apollo";
import { GET_EVENT_DATES } from "../queries/getEventDates";
import { GET_SELECTED_GROUPID } from "../queries/getSelectedGroupId";
import gql from "graphql-tag";
import LoadingIndicator from "./LoadingIndicator";
import ErrorMessage from "./ErrorMessage";

function normalizeData(data) {
  const dates = {};

  data.nodes.forEach(group => {
    if (
      group.groupOfPersonByGroupId.eventMembersByParticipant.nodes.length === 0
    )
      return;

    //Тут [0], т.к. событие только одно
    group.groupOfPersonByGroupId.eventMembersByParticipant.nodes[0].eventByEventId.timetablesByEventId.nodes.forEach(
      time => {
        //console.log(time.startTime);
        const date = time.startTime.split("T")[0];

        if (!dates[date])
          dates[date] = {
            selected: true,
            marked: true,
            single: true,
            timeId: time.id
          };
        else {
          dates[date].single = false;
          dates[date].timeId = null;
        }
      }
    );
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
      <Query query={gql(GET_SELECTED_GROUPID)}>
        {({
          data: { selectedGroup },
          loading: groupIdLoading,
          error: groupIdError
        }) => {
          if (groupIdError) return null; //?
          if (groupIdLoading) return null;

          return (
            <Query
              query={gql(GET_EVENT_DATES)}
              variables={{
                eventId: event.eventId,
                groupId:
                  selectedGroup.groupId !== -1
                    ? selectedGroup.groupId
                    : undefined
              }}
            >
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

                const markedDates = normalizeData(
                  data.currentPerson.personInGroupsByPersonId
                );

                return (
                  <ScrollView>
                    <Calendar
                      onDayPress={day => {
                        if (!markedDates[day.dateString]) return;

                        if (markedDates[day.dateString].single) {
                          this.props.navigation.push("EventInfoScreen", {
                            event: {
                              eventId: event.eventId,
                              timeId: markedDates[day.dateString].timeId
                            }
                          });
                        } else {
                          this.props.navigation.push("EventsOnDayScreen", {
                            event: {
                              eventId: event.eventId
                            },
                            date: day.dateString
                          });
                        }
                      }}
                      style={styles.calendar}
                      hideExtraDays
                      markedDates={markedDates}
                    />
                  </ScrollView>
                );
              }}
            </Query>
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
