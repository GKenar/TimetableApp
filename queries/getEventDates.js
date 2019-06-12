//Если слишком много дат одного события?
//Добавить в запрос параметр groupId
export const GET_EVENT_DATES = `
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