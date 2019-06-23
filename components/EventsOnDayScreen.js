import React from "react";
import { View, FlatList, TouchableHighlight } from "react-native";
import { Text, Divider, Badge, Button } from "react-native-elements";
import { Query } from "react-apollo";
import { GET_SELECTED_GROUPID } from "../queries/getSelectedGroupId";
import { GET_EVENTS_ON_DAY } from "../queries/getEventsOnDay";
import gql from "graphql-tag";
import LoadingIndicator from "./LoadingIndicator";
import ErrorMessage from "./ErrorMessage";
import { dateToHMS } from "./dateFunctions";

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
            startTime: dateToHMS(new Date(timetable.startTime + "Z")),
            endTime: dateToHMS(new Date(timetable.endTime + "Z")),
            groupAbbr: group.groupOfPersonByGroupId.abbrName
          });
        });
      }
    );
  });

  //Сортировка по времени
  data.sort((a, b) =>
    a.startTime > b.startTime ? 1 : a.startTime < b.startTime ? -1 : 0
  );

  return data;
}

export default class EventsOnDay extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: `События на ${navigation.getParam("date", "...")}`
    };
  };

  render() {
    const { eventId, timeIds } = this.props.navigation.getParam("event", null);

    return (
      <Query query={gql(GET_SELECTED_GROUPID)}>
        {({
          data: { selectedGroup },
          loading: groupIdLoading,
          error: groupIdError
        }) => {
          if (groupIdError) return null;
          if (groupIdLoading) return null;

          return (
            <Query
              query={gql(GET_EVENTS_ON_DAY)}
              variables={{
                eventId,
                timeIds,
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

                const listOfDayEvents = normalizeData(
                  data.currentPerson.personInGroupsByPersonId.nodes
                );

                const eventName = listOfDayEvents[0]
                  ? listOfDayEvents[0].eventName
                  : "undefined";

                return (
                  <View>
                    <Text h3 style={{ marginBottom: 20, textAlign: "center" }}>
                      {eventName}
                    </Text>
                    <FlatList
                      data={listOfDayEvents}
                      renderItem={({ item }) => (
                        <TouchableHighlight
                          style={{ marginBottom: 10 }}
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
                          <View>
                            <View
                              style={{
                                flex: 1,
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center"
                              }}
                            >
                              <Text h4>
                                {item.startTime}-{item.endTime}
                              </Text>
                              <Badge
                                badgeStyle={{ paddingVertical: 8 }}
                                value={
                                  <Text
                                    h4
                                    style={{ color: "white", margin: 10 }}
                                  >
                                    {item.groupAbbr}
                                  </Text>
                                }
                              />
                            </View>
                            <Divider />
                          </View>
                        </TouchableHighlight>
                      )}
                      keyExtractor={item => item.id.toString()}
                    />
                  </View>
                );
              }}
            </Query>
          );
        }}
      </Query>
    );
  }
}
