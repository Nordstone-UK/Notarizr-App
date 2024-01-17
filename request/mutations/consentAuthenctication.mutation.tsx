import gql from 'graphql-tag';

export const CONSENT_AUTHENTICATION = gql`
  mutation ConsentUserAuthentication(
    $fullName: String!
    $userAccessCode: String!
  ) {
    consentUserAuthentication(
      fullName: $fullName
      userAccessCode: $userAccessCode
    ) {
      message
      status
    }
  }
`;
