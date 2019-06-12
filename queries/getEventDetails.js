//Добавить NodeId и id тут и везде
export const GET_EVENT_DETAILS = `
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
