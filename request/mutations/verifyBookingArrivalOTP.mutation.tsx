import gql from 'graphql-tag';

export const VERIFY_BOOKING_ARRIVAL_OTP = gql`
  mutation VerifyBookingArrivalOTPR($bookingId: String!, $otp: String!) {
    verifyBookingArrivalOTPR(bookingId: $bookingId, otp: $otp) {
      status
      message
      booking {
        _id
        status
      }
    }
  }
`;
