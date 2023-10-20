import gql from 'graphql-tag';

export const UPDATE_SESSION = gql`
  mutation UpdateSessionR(
    $sessionId: String!
    $clientEmail: String
    $sessionSchedule: String
    $dateTimeSession: String
    $agentDocument: String
    $identityAuthentication: String
    $observers: [String]
    $price: Float
    $clientDocuments: JSON
  ) {
    updateSessionR(
      sessionId: $sessionId
      client_email: $clientEmail
      session_schedule: $sessionSchedule
      date_time_session: $dateTimeSession
      agent_document: $agentDocument
      identity_authentication: $identityAuthentication
      observers: $observers
      price: $price
      client_documents: $clientDocuments
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
