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
import ApolloClient from "apollo-boost";
import gql from "graphql-tag";
import { ApolloProvider, Query, ApolloConsumer, Mutation } from "react-apollo";
import { Agenda } from "react-native-calendars";

const client = new ApolloClient({
  uri: "http://ksa.spsu.ru/graphql",
  headers: {
    Authorization:
      "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiZGJfYWRtaW4iLCJwZXJzb25faWQiOjEsImlhdCI6MTU1ODAzNDEzMSwiZXhwIjoxNTU4MTIwNTMxLCJhdWQiOiJwb3N0Z3JhcGhpbGUiLCJpc3MiOiJwb3N0Z3JhcGhpbGUifQ.IlpFX4r1txJlF3Avrm9_iMEvUNQpyQyxffQdT8UlNhc"
  }
});

// const GETEVENTS = gql`
//   {
//     allPeople {
//       nodes {
//         id
//         name
//       }
//     }
//   }
// `;

// {
//   __typename: "EVENT",
//   id: 1,
//   name: "Название события",
//   body:
//     "Тестовое сообщение о событии, которое будет проходить где-то в такое-то время!",
//   date: dateToYMD(new Date()),
//   timeStart: "10:00",
//   timeEnd: "13:00",
//   hash: 1
// },

function dateToYMD(date) {
  return date.toISOString().split("T")[0];
}

const NormalizeData = (nodes, startDate, endDate) => {
  data = {};

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
        id: time.id,
        name: event.eventByEventId.name,
        startTime: startDateTime[1],
        endTime: endDateTime[1]
      });
    });
  });

  return data;
};

const GETEVENTS = gql`
  query GetEvents {
    groupOfPerson(nodeId: "WyJncm91cF9vZl9wZW9wbGUiLDIzMzhd") {
      eventMembersByParticipant {
        nodes {
          eventByEventId {
            id
            name
            timetablesByEventId(
              filter: {
                startTime: { greaterThanOrEqualTo: "2019-02-20T00:00:00" }
                endTime: { lessThanOrEqualTo: "2019-03-20T00:00:00" }
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
`;

const MonthQuery = () => (
  <Query
    query={GETEVENTS}
    errorPolicy="all"
    // variables={{ nodeId: "WyJncm91cF9vZl9wZW9wbGUiLDIzMzhd" }}
  >
    {({ data, error, loading, networkStatus }) => {
      if (error) return <Text>ERROR!</Text>;
      if (loading) return <Text>LOADING</Text>;

      //console.log(data);
      const listOfEvents = NormalizeData(
        data.groupOfPerson.eventMembersByParticipant.nodes,
        new Date("2019-02-20"),
        new Date("2019-03-20")
      );
      return (
        <Agenda
          items={listOfEvents}
          renderItem={renderItem}
          renderEmptyDate={renderEmptyDate}
          rowHasChanged={rowHasChanged}
          pastScrollRange={5}
          futureScrollRange={5}
          //refreshControl={null}
        />
      );
    }}
  </Query>
);
/* {data.groupOfPerson.eventMembersByParticipant.nodes.eventByEventId.map(
            item => (
              <Text key={item.id}>{item.name}</Text>
            )
          )} */

function renderEmptyDate() {
  return (
    <View style={styles.emptyDate}>
      <Divider />
    </View>
  );
}

function rowHasChanged(r1, r2) {
  //return r1.id + r1.hash !== r2.id + r2.hash;
  return r1.id !== r2.id;
}

function renderItem(item) {
  return (
    <View style={styles.item}>
      <Text style={{ textAlign: "left", fontSize: 20 }}>{`${item.startTime} - ${
        item.endTime
      }`}</Text>
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
  );
}

export default class TestScreen extends React.Component {
  render() {
    return (
      <ApolloProvider client={client}>
        <MonthQuery />
      </ApolloProvider>
    );
  }
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
    padding: 10,
    marginRight: 10,
    marginTop: 17
  },
  emptyDate: {
    height: 15,
    flex: 1,
    paddingTop: 50
  }
});
