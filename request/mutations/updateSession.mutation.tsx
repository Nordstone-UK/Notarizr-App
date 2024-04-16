import gql from 'graphql-tag';

export const UPDATE_SESSION = gql`
  mutation UpdateSessionR(
    $sessionId: String!
    $identityAuthentication: String
    $observers: [String]
    $paymentType:String!
  ) {
    updateSessionR(
      sessionId: $sessionId
      identity_authentication: $identityAuthentication
      observers: $observers
      payment_type:$paymentType


    ) {
      session {
        _id
        price
        client_documents
        status
        client_email
        observers
        identity_authentication
        session_schedule
        date_time_session
        agent_document
        createdAt
        updatedAt
      }
      message
      status
    }
  }
`;
