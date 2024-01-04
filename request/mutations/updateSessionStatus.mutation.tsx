import gql from 'graphql-tag';

export const UPDATE_SESSION_STATUS = gql`
  mutation UpdateSessionStatus($sessionId: String!, $status: String!) {
    updateSessionStatus(sessionId: $sessionId, status: $status) {
      status
      message
      session {
        _id
        status
      }
    }
  }
`;
