import gql from 'graphql-tag';

export const GET_AGENT_SESSION_CHAT = gql`
  query GetAgentSessions($status: String!, $page: Int!, $pageSize: Int!) {
    getAgentSessions(status: $status, page: $page, pageSize: $pageSize) {
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
