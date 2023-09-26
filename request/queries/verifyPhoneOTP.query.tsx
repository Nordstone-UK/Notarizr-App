import gql from 'graphql-tag';

export const VERIFY_PHONE_OTP = gql`
  query GetPhoneOTP($otp: String!, $email: String!) {
    verifyPhoneOTP(otp: $otp, email: $email) {
      message
      status
      accessToken
    }
  }
`;
