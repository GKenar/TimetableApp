export const AUTH = `
  mutation Authentification($login: String!, $password: String!) {
    authenticate(input: { login: $login, password: $password }) {
      clientMutationId
      jwtToken
    }
  }
`;
