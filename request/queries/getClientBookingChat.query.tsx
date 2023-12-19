import gql from 'graphql-tag';

export const GET_CLIENT_BOOKING_CHAT = gql`
  query GetClientBookings($status: String!, $page: Int!, $pageSize: Int!) {
    getClientBookings(status: $status, page: $page, pageSize: $pageSize) {
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
          first_name
          email
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
