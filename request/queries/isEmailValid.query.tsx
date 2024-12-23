import gql from 'graphql-tag';

export const IS_EMAIL_VALID = gql`
  query IsEmailValid($email: String!) {
    isEmailValid(email: $email) {
      status
      emailTaken
    }
  }
`;

