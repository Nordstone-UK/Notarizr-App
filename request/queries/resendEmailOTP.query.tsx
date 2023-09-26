import gql from 'graphql-tag';

export const RESEND_EMAIL_OTP = gql`
  query ResendEmailOTP($email: String!, $newUser: Boolean) {
    resendEmailOTP(email: $email, new_user: $newUser) {
      message
      status
    }
  }
`;
