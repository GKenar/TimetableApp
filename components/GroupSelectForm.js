import React from "react";
import { StyleSheet, View, FlatList } from "react-native";
import { Text, Button, Divider } from "react-native-elements";
import { Query, ApolloConsumer, Mutation } from "react-apollo";
import gql from "graphql-tag";

const GET_GROUPS_LIST = gql`
  query GetGroupsList {
    currentPerson {
      nodeId
      personInGroupsByPersonId {
        nodes {
          nodeId
          groupOfPersonByGroupId {
            nodeId
            abbrName
          }
        }
      }
    }
  }
`;

export default class GroupSelectForm extends React.Component {
  render() {
    return (
      <Query query={GET_GROUPS_LIST}>
        {({ data, loading, error }) => {
          if (error) {
            console.log(error);
            return <Text>Error</Text>;
          }
          if (loading) return <Text>Loading...</Text>;

          console.log(data);

          return (
            <FlatList
              data={data.currentPerson.personInGroupsByPersonId.nodes}
              renderItem={({ item }) => (
                <Text key>{item.groupOfPersonByGroupId.abbrName}</Text>
              )}
              keyExtractor={item => item.groupOfPersonByGroupId.nodeId.toString()}
            />
          );
        }}
      </Query>
    );
  }
}
