import React from "react";
import { StyleSheet, View, TouchableHighlight } from "react-native";
import {
  Input,
  Header,
  Text,
  Button,
  SocialIcon,
  Divider
} from "react-native-elements";
import { Agenda } from "react-native-calendars";
import { Query, ApolloConsumer, Mutation } from "react-apollo";
import gql from "graphql-tag";
import lodash from "lodash";
import calendarLocalization from "./calendarLocalization"; //???

const GET_EVENTS = gql`
  query GetEvents($minDate: Datetime!, $maxDate: Datetime!) {
    currentPerson {
      nodeId
      personInGroupsByPersonId {
        nodes {
          nodeId
          groupOfPersonByGroupId {
            nodeId
            eventMembersByParticipant {
              nodes {
                nodeId
                eventByEventId {
                  nodeId
                  id
                  name
                  timetablesByEventId(
                    filter: {
                      startTime: {
                        greaterThanOrEqualTo: $minDate
                        lessThanOrEqualTo: $maxDate
                      }
                    }
                    condition: {}
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

function daysInMonth(month, year) {
  const days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const daysLeap = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  return (year % 4 == 0 && year % 100 != 0) || year % 400 == 0
    ? daysLeap[month]
    : days[month];
}

function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

//Можно вынести в отдельный модуль
function dateToYMD(date) {
  return date.toISOString().split("T")[0];
}

//Приводит данные с сервера в пригодный для agenda вид
const normalizeData = (nodes, startDate, endDate) => {
  data = {};

  //console.log(startDate);
  //console.log(endDate);

  //fill dates:
  while (startDate.getTime() < endDate.getTime()) {
    data[dateToYMD(startDate)] = [];
    startDate.setDate(startDate.getDate() + 1);
  }
  data[dateToYMD(endDate)] = [];

  nodes.forEach(event => {
    //console.log(event);

    event.eventByEventId.timetablesByEventId.nodes.forEach(time => {
      const startDateTime = time.startTime.split("T");
      const endDateTime = time.endTime.split("T");

      if (!data[startDateTime[0]]) {
        data[startDateTime[0]] = [];
      }

      data[startDateTime[0]].push({
        eventId: event.eventByEventId.id,
        timeId: time.id,
        name: event.eventByEventId.name,
        startTime: startDateTime[1],
        endTime: endDateTime[1]
      });
    });
  });
  return data;
};

function unionEvents(prev, current) {
  //Можно изменять acc??
  const prevToArray = prev.reduce(
    (
      acc,
      { eventByEventId: item, nodeId: eventMembersByParticipantNodeId }
    ) => {
      const arr = [];
      item.timetablesByEventId.nodes.forEach(el =>
        arr.push({
          eventMembersByParticipantNodeId,
          eventNodeId: item.nodeId,
          eventId: item.id,
          name: item.name,
          timeNodeId: el.nodeId,
          timeId: el.id,
          startTime: el.startTime,
          endTime: el.endTime,
          placeId: el.placeId
        })
      );
      return [...acc, ...arr];
    },
    []
  );

  const currToArray = current.reduce(
    (
      acc,
      { eventByEventId: item, nodeId: eventMembersByParticipantNodeId }
    ) => {
      const arr = [];
      item.timetablesByEventId.nodes.forEach(el =>
        arr.push({
          eventMembersByParticipantNodeId,
          eventNodeId: item.nodeId,
          eventId: item.id,
          name: item.name,
          timeNodeId: el.nodeId,
          timeId: el.id,
          startTime: el.startTime,
          endTime: el.endTime,
          placeId: el.placeId
        })
      );
      return [...acc, ...arr];
    },
    []
  );

  const unionPrevAndCurr = lodash.unionBy(prevToArray, currToArray, "timeId");

  const combination = unionPrevAndCurr.reduce((acc, el) => {
    let newObj = { ...acc };
    if (!newObj[el.eventMembersByParticipantNodeId]) {
      newObj[el.eventMembersByParticipantNodeId] = {
        eventByEventId: {
          nodeId: el.eventNodeId,
          id: el.eventId,
          name: el.name,
          timetablesByEventId: {
            nodes: [
              {
                nodeId: el.timeNodeId,
                id: el.timeId,
                startTime: el.startTime,
                endTime: el.endTime,
                placeId: el.placeId,
                __typename: "Timetable"
              }
            ],
            __typename: "TimetablesConnection"
          },
          __typename: "EventMember"
        },
        __typename: "Event"
      };
    } else {
      newObj[
        el.eventMembersByParticipantNodeId
      ].eventByEventId.timetablesByEventId.nodes.push({
        nodeId: el.timeNodeId,
        id: el.timeId,
        startTime: el.startTime,
        endTime: el.endTime,
        placeId: el.placeId,
        __typename: "Timetable"
      });
    }
    return newObj;
  }, {});

  const finalResult = Object.keys(combination).map(nodeId => ({
    ...combination[nodeId],
    nodeId
  }));

  //console.log(finalResult);
  return finalResult;
}

export default class EventsScreen extends React.Component {
  constructor(props) {
    super(props);

    this.minDate = new Date();
    this.minDate.setDate(1);
    this.maxDate = new Date();
    this.maxDate.setMonth(this.maxDate.getMonth() + 1);
    this.maxDate.setDate(1);
    // this.minDate = new Date("2019-03-01");
    // this.maxDate = new Date("2019-04-01");
  }

  render() {
    return (
      <Query
        query={GET_EVENTS}
        variables={{ minDate: this.minDate, maxDate: this.maxDate }}
        notifyOnNetworkStatusChange
      >
        {({ data, error, refetch, loading, fetchMore, networkStatus }) => {
          if (error) {
            console.log(error);
            return (
              <View>
                <Text>Error</Text>
                <Button
                  title="Refresh"
                  onPress={() =>
                    refetch({ minDate: this.minDate, maxDate: this.maxDate })
                  }
                />
              </View>
            );
          }
          if (networkStatus === 1)
            return (
              <View>
                <Text>Loading</Text>
              </View>
            );

          //Тут [0]
          const events = normalizeData(
            data.currentPerson.personInGroupsByPersonId.nodes[0]
              .groupOfPersonByGroupId.eventMembersByParticipant.nodes,
            new Date(this.minDate),
            new Date(this.maxDate)
            // this.minDate,
            // this.maxDate
          );

          console.log("max: " + this.maxDate);
          console.log("min: " + this.minDate);

          return (
            <Agenda
              items={events}
              onDayPress={date => {
                //console.log(date);
                //this.currentDate = new Date(date.dateString); //Всегда верно?
              }}
              onDayChange={day => {
                //Тут можно подгружать данные на следующий месяц, когда близко подходим к нему
                //console.log("day changed " + day);
              }}
              loadItemsForMonth={date => {
                //Поменять названия?
                const firstDayOfMonth = new Date(date.year, date.month - 1, 1);
                //Упростить?
                const lastDayOfMonth = addDays(
                  new Date(
                    date.year,
                    date.month - 1,
                    daysInMonth(date.month - 1, date.year)
                  ),
                  1
                );

                //console.log(date);
                //console.log(firstDayOfMonth);
                //console.log(lastDayOfMonth);

                //Когда дергаешь быстро календарь, то не загружаются события
                let fetchDateIntervalStart;
                let fetchDateIntervalEnd;
                let needFetchMore = false;
                //Начальный интервал minDate и maxDate должны быть равны месяцу
                if (firstDayOfMonth < this.minDate) {
                  fetchDateIntervalStart = firstDayOfMonth;
                  fetchDateIntervalEnd = this.minDate;

                  //this.minDate = firstDayOfMonth; Перенёс в updateQuery
                  needFetchMore = true;
                }
                if (lastDayOfMonth > this.maxDate) {
                  fetchDateIntervalStart = this.maxDate;
                  fetchDateIntervalEnd = lastDayOfMonth;

                  //this.maxDate = lastDayOfMonth;
                  needFetchMore = true;
                }

                console.log(needFetchMore);

                if (!needFetchMore) return;

                fetchMore({
                  variables: {
                    minDate: fetchDateIntervalStart,
                    maxDate: fetchDateIntervalEnd
                  },
                  updateQuery: (prev, { fetchMoreResult, variables }) => {
                    if (variables.minDate < this.minDate) {
                      this.minDate = variables.minDate;
                    }

                    if (variables.maxDate > this.maxDate) {
                      this.maxDate = variables.maxDate;
                    }

                    if (!fetchMoreResult) return prev;

                    const combination = unionEvents(
                      prev.currentPerson.personInGroupsByPersonId.nodes[0]
                        .groupOfPersonByGroupId.eventMembersByParticipant.nodes,
                      fetchMoreResult.currentPerson.personInGroupsByPersonId
                        .nodes[0].groupOfPersonByGroupId
                        .eventMembersByParticipant.nodes
                    );

                    const result = {
                      currentPerson: {
                        personInGroupsByPersonId: {
                          nodes: [
                            {
                              groupOfPersonByGroupId: {
                                eventMembersByParticipant: {
                                  nodes: combination,
                                  __typename: "EventMembersConnection"
                                },
                                __typename: "GroupOfPerson",
                                nodeId:
                                  prev.currentPerson.personInGroupsByPersonId
                                    .nodes[0].groupOfPersonByGroupId.nodeId
                              },
                              __typename: "PersonInGroup",
                              nodeId:
                                prev.currentPerson.personInGroupsByPersonId
                                  .nodes[0].nodeId
                            }
                          ],
                          __typename: "PersonInGroupsConnection"
                        },
                        __typename: "Person",
                        nodeId: prev.currentPerson.nodeId
                      }
                    };
                    return result;
                  }
                });
              }}
              //onDayChange={(day)=>{console.log('day changed')}}
              //selected={new Date("2019-03-01")}
              renderItem={this.renderItem.bind(this)}
              renderEmptyDate={this.renderEmptyDate}
              rowHasChanged={this.rowHasChanged}
              pastScrollRange={10}
              futureScrollRange={10}
              onRefresh={() => {
                refetch({ minDate: this.minDate, maxDate: this.maxDate });
              }}
              refreshing={networkStatus === 4 || networkStatus === 3}
              //refreshControl={null}
            />
          );
        }}
      </Query>
    );
  }

  renderEmptyDate() {
    return (
      <View style={styles.emptyDate}>
        <Divider style={{ backgroundColor: "blue" }} />
      </View>
    );
  }

  rowHasChanged(r1, r2) {
    return r1.timeId !== r2.timeId; //????????
  }

  renderItem(item) {
    return (
      <View style={styles.item}>
        <TouchableHighlight
          onPress={() =>
            this.props.navigation.navigate("EventDetailsScreen", {
              event: item
            })
          }
          underlayColor="#FAFAFA"
          activeOpacity={0.9}
        >
          <View style={{ padding: 10 }}>
            {/* контейнер? */}
            <Text style={{ textAlign: "left", fontSize: 20 }}>{`${
              item.startTime
            } - ${item.endTime}`}</Text>
            <Text
              style={{
                textAlign: "left",
                fontSize: 22,
                fontWeight: "bold",
                marginTop: 5,
                marginBottom: 5
              }}
            >
              {item.name}
            </Text>
            <Text style={{ textAlign: "left", fontSize: 20, color: "#505064" }}>
              {"Описание"}
            </Text>
          </View>
        </TouchableHighlight>
      </View>
    );
  }

  //loadItems(month) {
  //  console.log(month);
  //}
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    alignItems: "stretch",
    justifyContent: "center"
  },
  item: {
    backgroundColor: "white",
    flex: 1,
    borderRadius: 5,
    marginRight: 10,
    marginTop: 17
  },
  emptyDate: {
    height: 15,
    flex: 1,
    paddingTop: 50
  }
});
