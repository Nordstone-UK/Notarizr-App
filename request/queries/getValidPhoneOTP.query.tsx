import gql from 'graphql-tag';

export const GET_VALID_PHONE_OTP = gql`
  query GetValidPhoneOtp($phoneNumber: String!) {
    getValidPhoneOtp(phone_number: $phoneNumber) {
      message
      status
      phoneNumber
    }
  }
`;
