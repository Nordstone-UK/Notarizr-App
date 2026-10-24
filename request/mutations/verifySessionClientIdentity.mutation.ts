import {gql} from '@apollo/client';

export const VERIFY_SESSION_CLIENT_IDENTITY = gql`
  mutation VerifySessionClientIdentity(
    $recordId: String!
    $verified: Boolean!
  ) {
    verifySessionClientIdentityR(recordId: $recordId, verified: $verified) {
      status
      message
    }
  }
`;
