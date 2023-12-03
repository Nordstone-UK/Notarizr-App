import gql from 'graphql-tag';

export const GET_AGENT_SESSION = gql`
  query GetAgentSessions($status: String!, $page: Int!, $pageSize: Int!) {
    getAgentSessions(status: $status, page: $page, pageSize: $pageSize) {
      status
      message
      sessions {
        _id
        price
        client_documents
        status
        client_email
        observers
        identity_authentication
        session_schedule
        date_time_session
        zoom_id
        zoom_password
        zoom_agenda
        zoom_host_email
        zoom_host_id
        zoom_join_url
        zoom_start_url
        createdAt
        updatedAt
        agent_document
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
        document_type {
          name
          price
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
        signature_request_id
        signatures {
          signatureId
          signerName
          signerEmailAddress
          order
          signature_url
        }
        agora_channel_name
        agora_channel_token
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
