import gql from 'graphql-tag';

export const GET_SESSION_STATUS = gql`
  query GetSession($sessionId: String!) {
    getSession(sessionId: $sessionId) {
      message
      status
      session {
        status
        _id
      }
    }
  }
`;
