import gql from 'graphql-tag';

export const CREATE_AUTHENTICATION = gql`
  mutation CreateAuthenticationUser {
    createAuthenticationUser {
      message
      status
    }
  }
`;
