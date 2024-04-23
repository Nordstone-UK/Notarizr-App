import gql from 'graphql-tag';

export const GET_SESSION_BY_ID = gql`
  query GetSession($sessionId: String!) {
    getSession(sessionId: $sessionId) {
      session {
        _id
        agent {
          _id
          first_name
          last_name
          email
          phone_number
          profile_picture
          gender
          isBlocked
          chatPrivacy
          location
          rating
          subscriptionType
          isVerified
          account_type
          online_status
          current_location {
            type
            coordinates
          }
          description
          state
          addresses {
            tag
            location
          }
        }
        client {
          _id
          first_name
          last_name
          email
          phone_number
          profile_picture
          gender
          isBlocked
          chatPrivacy
          location
          rating
          subscriptionType
          isVerified
          account_type
          online_status
          description
          state
        }
        price
        client_documents
        notarized_docs
        status
        document_type {
          name
          price
        }
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
        payment_type
      }
      message
      status
    }
  }
`;
