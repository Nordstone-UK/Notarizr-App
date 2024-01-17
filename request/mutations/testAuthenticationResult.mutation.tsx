import gql from 'graphql-tag';

export const TEST_AUTHENCATION = gql`
  mutation TestAuthenticationResult {
    testAuthenticationResult {
      message
      status
    }
  }
`;
