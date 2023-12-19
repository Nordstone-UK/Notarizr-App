import gql from 'graphql-tag';

export const GET_CLIENT_SESSION_CHAT = gql`
  query GetClientSessions($status: String!, $page: Int!, $pageSize: Int!) {
    getClientSessions(status: $status, page: $page, pageSize: $pageSize) {
      status
      message
      sessions {
        _id
        agent {
          _id
          email
          first_name
          last_name
          profile_picture
        }
        client {
          _id
          email
          first_name
          last_name
          profile_picture
        }
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
