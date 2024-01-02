import gql from 'graphql-tag';

export const GET_AGENT_SESSION = gql`
  query GetAgentSessions($status: String!, $page: Int!, $pageSize: Int!) {
    getAgentSessions(status: $status, page: $page, pageSize: $pageSize) {
      status
      message
      sessions {
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
      }
      totalDocs
      limit
      totalPages
      page
      pagingCounter
      hasPrevPage
      hasNextPage
      prevPage
      nextPage
    }
  }
`;
