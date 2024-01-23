import gql from 'graphql-tag';

export const UPDATE_SESSION_PRICEDOCS = gql`
  mutation UpdateSessionR(
    $sessionId: String!
    $price: Float
    $clientDocuments: JSON
  ) {
    updateSessionR(
      sessionId: $sessionId
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
        agora_channel_name
        agora_channel_token
        signature_request_id
        signatures {
          signatureId
          signerName
          signerEmailAddress
          order
          signature_url
        }
        createdAt
        updatedAt
      }
      message
      status
    }
  }
`;
