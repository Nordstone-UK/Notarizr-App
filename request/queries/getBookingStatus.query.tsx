import gql from 'graphql-tag';

export const GET_BOOKING_STATUS = gql`
  query GetBookingStatus($bookingId: String!) {
    getBookingStatus(bookingId: $bookingId) {
      status
      message
      booking_status
    }
  }
`;
