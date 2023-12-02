import gql from 'graphql-tag';

export const GET_CLIENT_SESSION = gql`
  query GetClientSessions($status: String!, $page: Int!, $pageSize: Int!) {
    getClientSessions(status: $status, page: $page, pageSize: $pageSize) {
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
        zoom_id
        zoom_password
        zoom_agenda
        zoom_host_email
        zoom_host_id
        zoom_join_url
        zoom_start_url
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
