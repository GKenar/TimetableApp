import gql from "graphql-tag";

//Добавить NodeId и id тут и везде
export const GET_EVENT_DETAILS = gql`
  query GetEvent($eventId: Int!, $timetableId: Int!) {
    eventById(id: $eventId) {
      nodeId
      id
      name
      timetablesByEventId(condition: { id: $timetableId }) {
        nodes {
          nodeId
          startTime
          endTime
          placeByPlaceId {
            nodeId
            name
          }
        }
      }
    }
  }
`;

//Если слишком много дат одного события?
//Добавить в запрос параметр groupId
export const GET_EVENT_DATES = gql`
  query GetEventDates($eventId: Int!, $groupId: Int) {
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
                  name
                  timetablesByEventId {
                    nodes {
                      nodeId
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

export const GET_EVENTS_ON_DAY = gql`
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

export const GET_EVENTS = gql`
  query GetEvents($minDate: Datetime!, $maxDate: Datetime!, $groupId: Int) {
    currentPerson {
      nodeId
      personInGroupsByPersonId(condition: { groupId: $groupId }) {
        nodes {
          nodeId
          groupId
          groupOfPersonByGroupId {
            nodeId
            abbrName
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

export const GET_GROUPS_LIST = gql`
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

export const SET_SELECTED_GROUPID = gql`
  mutation SetSelectedGroupId($groupId: Int!) {
    setSelectedGroupId(groupId: $groupId) @client
  }
`;

export const AUTH = gql`
  mutation Authentification($login: String!, $password: String!) {
    authenticate(input: { login: $login, password: $password }) {
      clientMutationId
      jwtToken
    }
  }
`;