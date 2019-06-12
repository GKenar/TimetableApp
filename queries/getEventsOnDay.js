export const GET_EVENTS_ON_DAY = `
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