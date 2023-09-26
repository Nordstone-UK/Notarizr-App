import gql from 'graphql-tag';

export const GET_PHONE_OTP = gql`
  query GetPhoneOTP($email: String!) {
    getPhoneOTP(email: $email) {
      message
      status
      phoneNumber
    }
  }
`;
