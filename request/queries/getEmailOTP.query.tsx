import gql from 'graphql-tag';

export const GET_EMAIL_OTP = gql`
  query GetEmailOTP($email: String!, $newUser: Boolean) {
    getEmailOTP(email: $email, new_user: $newUser) {
      message
      status
    }
  }
`;
