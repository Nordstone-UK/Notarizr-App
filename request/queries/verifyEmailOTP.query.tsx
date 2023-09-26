import gql from 'graphql-tag';

export const VERIFY_EMAIL_OTP = gql`
  query VerifyEmailOTP($otp: String!, $email: String!) {
    verifyEmailOTP(otp: $otp, email: $email) {
      is_new_user
      access_token
      message
      status
      id
    }
  }
`;
