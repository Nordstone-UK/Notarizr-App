import gql from 'graphql-tag';

export const GET_PHONE_OTP = gql`
  query GetPhoneOTP($phone: String!) {
    getPhoneOTP(phone: $phone) {
      message
      status
      phoneNumber
    }
  }
`;
