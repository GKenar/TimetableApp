import React from "react";
import { StyleSheet, View, FlatList, Picker } from "react-native";
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
            id
            abbrName
          }
        }
      }
    }
  }
`;

export const GET_SELECTED_GROUPID = gql`
  {
    selectedGroup {
      groupId
    }
  }
`;
const SET_SELECTED_GROUPID = gql`
  mutation SetSelectedGroupId($groupId: Int!) {
    setSelectedGroupId(groupId: $groupId) @client
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
            <Query query={GET_SELECTED_GROUPID}>
              {({ data: dataa, loading: loading2, error: error2 }) => {
                if (loading2) return null;
                if (error2) return null;

                console.log(dataa);

                return (
                  <Mutation mutation={SET_SELECTED_GROUPID}>
                    {setGroupId => (
                      <View>
                        <Picker
                          style={{ height: 50, width: 100 }}
                          selectedValue={dataa.selectedGroup.groupId}
                          onValueChange={(itemValue, itemIndex) => {
                            console.log(itemValue);
                            setGroupId({
                              variables: {
                                groupId: itemValue
                              }
                            });
                          }}
                        >
                          <Picker.Item key={"All"} label="Все" value={-1} />
                          {data.currentPerson.personInGroupsByPersonId.nodes.map(
                            group => (
                              <Picker.Item
                                key={group.groupOfPersonByGroupId.nodeId.toString()}
                                label={group.groupOfPersonByGroupId.abbrName}
                                value={group.groupOfPersonByGroupId.id}
                              />
                            )
                          )}
                        </Picker>
                        {/* <FlatList
                          data={
                            data.currentPerson.personInGroupsByPersonId.nodes
                          }
                          renderItem={({ item }) => (
                            <Button
                              key
                              title={item.groupOfPersonByGroupId.abbrName}
                              onPress={() =>
                                setGroupId({
                                  variables: {
                                    groupId: item.groupOfPersonByGroupId.id
                                  }
                                })
                              }
                            />
                          )}
                          keyExtractor={item =>
                            item.groupOfPersonByGroupId.nodeId.toString()
                          }
                        /> */}
                      </View>
                    )}
                  </Mutation>
                );
              }}
            </Query>
          );
        }}
      </Query>
    );
  }
}
