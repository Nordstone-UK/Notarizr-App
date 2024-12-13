import gql from 'graphql-tag';

export const VERIFY_PHONE_OTP = gql`
  query GetPhoneOTP($otp: String!, $phone: String!) {
    verifyPhoneOTP(otp: $otp, phone: $phone) {
      message
      status
      accessToken
    }
  }
`;
