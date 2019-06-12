import React from "react";
import { StyleSheet, View, TouchableHighlight } from "react-native";
import { Text, Button, Divider, Badge } from "react-native-elements";
import { Agenda } from "react-native-calendars";
import { Query } from "react-apollo";
import lodash from "lodash";
import calendarLocalization from "./calendarLocalization"; //???
import { GET_EVENTS } from "../queries/getEvents";
import { daysInMonth, dateToYMD, addDays } from "./dateFunctions";
import LoadingIndicator from "./LoadingIndicator";
import gql from "graphql-tag";

//Приводит данные с сервера в пригодный для agenda вид
const normalizeData = (requestedData, startDate, endDate) => {
  const data = {};

  //fill empty dates:
  while (startDate.getTime() < endDate.getTime()) {
    data[dateToYMD(startDate)] = [];
    startDate.setDate(startDate.getDate() + 1);
  }
  data[dateToYMD(endDate)] = [];

  requestedData.nodes.forEach(group => {
    group.groupOfPersonByGroupId.eventMembersByParticipant.nodes.forEach(
      event => {
        //console.log(event);
        event.eventByEventId.timetablesByEventId.nodes.forEach(time => {
          const startDateTime = time.startTime.split("T");
          const endDateTime = time.endTime.split("T");

          if (!data[startDateTime[0]]) {
            data[startDateTime[0]] = [];
          }

          data[startDateTime[0]].push({
            id:
              group.groupOfPersonByGroupId.nodeId +
              event.eventByEventId.id +
              time.id,
            eventId: event.eventByEventId.id,
            timeId: time.id,
            name: event.eventByEventId.name,
            startTime: startDateTime[1],
            endTime: endDateTime[1],
            groupAbbr: group.groupOfPersonByGroupId.abbrName
          });
        });
      }
    );
  });

  //Нужна сортировка по времени!

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

    //Время то текущее ставится!!!!
    this.minDate = new Date();
    this.minDate.setDate(1);
    this.minDate.setHours(0);
    this.minDate.setMinutes(0);
    this.minDate.setSeconds(0);

    this.maxDate = new Date();
    this.maxDate.setMonth(this.maxDate.getMonth() + 1);
    this.maxDate.setDate(1);
    this.maxDate.setHours(0);
    this.maxDate.setMinutes(0);
    this.maxDate.setSeconds(0);
    // this.minDate = new Date("2019-03-01");
    // this.maxDate = new Date("2019-04-01");
  }

  render() {
    return (
      <Query
        query={gql(GET_EVENTS)}
        variables={{
          minDate: this.minDate,
          maxDate: this.maxDate,
          groupId: this.props.groupId !== -1 ? this.props.groupId : undefined
        }}
        notifyOnNetworkStatusChange
      >
        {({ data, error, refetch, fetchMore, networkStatus }) => {
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
          if (networkStatus === 1) return <LoadingIndicator />;

          if (data.currentPerson === undefined) {
            console.log("status:");
            console.log(networkStatus);
          }

          const events = normalizeData(
            data.currentPerson.personInGroupsByPersonId,
            new Date(this.minDate),
            new Date(this.maxDate)
          );

          //console.log(networkStatus);
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
                const firstDayOfMonth = new Date(
                  date.year,
                  date.month - 1,
                  1,
                  0,
                  0,
                  0,
                  0
                );
                //Упростить?
                const lastDayOfMonth = addDays(
                  new Date(
                    date.year,
                    date.month - 1,
                    daysInMonth(date.month - 1, date.year),
                    0,
                    0,
                    0,
                    0
                  ),
                  1
                );

                //Когда дергаешь быстро календарь, то не загружаются события
                let fetchDateIntervalStart;
                let fetchDateIntervalEnd;
                let needFetchMore = false;
                //Начальный интервал minDate и maxDate должны быть равны месяцу
                if (firstDayOfMonth < this.minDate) {
                  fetchDateIntervalStart = firstDayOfMonth;
                  fetchDateIntervalEnd = this.minDate;

                  needFetchMore = true;
                }
                if (lastDayOfMonth > this.maxDate) {
                  fetchDateIntervalStart = this.maxDate;
                  fetchDateIntervalEnd = lastDayOfMonth;

                  needFetchMore = true;
                }

                console.log(needFetchMore);

                if (!needFetchMore) return;

                fetchMore({
                  variables: {
                    minDate: fetchDateIntervalStart,
                    maxDate: fetchDateIntervalEnd,
                    groupId:
                      this.props.groupId !== -1 ? this.props.groupId : undefined
                  },
                  updateQuery: (prev, { fetchMoreResult, variables }) => {
                    if (variables.minDate < this.minDate) {
                      this.minDate = variables.minDate;
                    }

                    if (variables.maxDate > this.maxDate) {
                      this.maxDate = variables.maxDate;
                    }

                    if (!fetchMoreResult) return prev;

                    return this.unionQueryResults(prev, fetchMoreResult);
                  }
                });
              }}
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

  unionQueryResults(prev, fetchMoreResult) {
    const groups = [];

    prev.currentPerson.personInGroupsByPersonId.nodes.forEach((item, index) => {
      const combination = unionEvents(
        prev.currentPerson.personInGroupsByPersonId.nodes[index]
          .groupOfPersonByGroupId.eventMembersByParticipant.nodes,
        fetchMoreResult.currentPerson.personInGroupsByPersonId.nodes[index]
          .groupOfPersonByGroupId.eventMembersByParticipant.nodes
      );

      groups[index] = {
        groupOfPersonByGroupId: {
          eventMembersByParticipant: {
            nodes: combination,
            __typename: "EventMembersConnection"
          },
          __typename: "GroupOfPerson",
          nodeId: item.groupOfPersonByGroupId.nodeId,
          abbrName: item.groupOfPersonByGroupId.abbrName
        },
        __typename: "PersonInGroup",
        nodeId: item.nodeId,
        groupId: item.groupId
      };
    });

    const result = {
      currentPerson: {
        personInGroupsByPersonId: {
          nodes: groups,
          __typename: "PersonInGroupsConnection"
        },
        __typename: "Person",
        nodeId: prev.currentPerson.nodeId
      }
    };
    return result;
  }

  renderEmptyDate() {
    return (
      <View style={styles.emptyDate}>
        <Divider style={{ backgroundColor: "blue" }} />
      </View>
    );
  }

  rowHasChanged(r1, r2) {
    return r1.id !== r2.id;
  }

  renderItem(item) {
    return (
      <View style={styles.item}>
        <TouchableHighlight
          onPress={() =>
            this.props.navigation.navigate("EventDetailsScreen", {
              event: { eventId: item.eventId, timeId: item.timeId }
            })
          }
          underlayColor="#FAFAFA"
          activeOpacity={0.9}
        >
          <View style={{ padding: 10 }}>
            {/* контейнер? */}
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "space-between"
              }}
            >
              <Text style={{ textAlign: "left", fontSize: 20 }}>{`${
                item.startTime
              } - ${item.endTime}`}</Text>
              <Badge
                style={{ margin: 20 }}
                value={
                  <Text
                    style={{
                      color: "white",
                      margin: 10,
                      fontSize: 20
                    }}
                  >
                    {item.groupAbbr}
                  </Text>
                }
              />
            </View>
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
