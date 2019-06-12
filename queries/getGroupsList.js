export const GET_GROUPS_LIST = `
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