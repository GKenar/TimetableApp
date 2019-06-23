export const GET_EVENTS_ON_DAY = `
  query GetEventsOnDay(
    $eventId: Int!
    $groupId: Int
    $timeIds: [Int!]
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
                    filter: { id: { in: $timeIds } }
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
