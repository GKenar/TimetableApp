export const SET_SELECTED_GROUPID = `
  mutation SetSelectedGroupId($groupId: Int!) {
    setSelectedGroupId(groupId: $groupId) @client
  }
`;