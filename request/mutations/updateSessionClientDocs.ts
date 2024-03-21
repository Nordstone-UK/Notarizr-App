import gql from 'graphql-tag';

export const UPDATE_SESSION_CLIENT_DOCS = gql`
  mutation sessionUpdateClientDocuments(
    $sessionId: String!
    $key: String!
    $value: String!
  ) {
    sessionUpdateClientDocuments(
      sessionId: $sessionId
      key: $key
      value: $value
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

export const UPDATE_OR_CREATE_SESSION_CLIENT_DOCS = gql`
  mutation CreateOrUpdateClientDocs(
    $sessionId: String!
    $clientDocuments: [ClientDocsType!]!
  ) {
    createOrUpdateClientDocs(
      sessionId: $sessionId
      clientDocuments: $clientDocuments
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
