import { gql } from '@apollo/client';

export const VERIFY_SIGNUP_WITH_OTP = gql`
  query VerifySignUpOTP($otp: String!, $phoneNumber: String!) {
    verifySignUpOTP(otp: $otp, phoneNumber: $phoneNumber) {
      is_new_user
      access_token
      message
      status
      id
    }
  }
`;

