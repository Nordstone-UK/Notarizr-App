import gql from 'graphql-tag';

export const GET_AGENT_BOOKING_CHAT = gql`
  query GetAgentBookings($status: String!, $page: Int!, $pageSize: Int!) {
    getAgentBookings(status: $status, page: $page, pageSize: $pageSize) {
      status
      message
      bookings {
        _id
        agent {
          _id
          email
          first_name
          last_name
          profile_picture
        }
        booked_by {
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
