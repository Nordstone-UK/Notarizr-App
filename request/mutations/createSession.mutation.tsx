import gql from 'graphql-tag';

export const CREATE_SESSION = gql`
  mutation CreateSessionR(
    $clientEmail: String!
    $sessionSchedule: String!
    $dateTimeSession: String!
    $agentDocument: [String!]!
    $identityAuthentication: String!
    $observers: [String!]!
    $price: Float!
    $documentType: [documentTypeInput!]!
  ) {
    createSessionR(
      client_email: $clientEmail
      session_schedule: $sessionSchedule
      date_time_session: $dateTimeSession
      agent_document: $agentDocument
      identity_authentication: $identityAuthentication
      observers: $observers
      price: $price
      document_type: $documentType
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
        zoom_id
        zoom_join_url
        zoom_password
      }
      message
      status
    }
  }
`;
