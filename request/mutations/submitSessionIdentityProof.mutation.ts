import {gql} from '@apollo/client';

export const SUBMIT_SESSION_IDENTITY_PROOF = gql`
  mutation SubmitSessionIdentityProof(
    $recordId: String!
    $identityProof: JSON!
  ) {
    submitSessionIdentityProofR(
      recordId: $recordId
      identityProof: $identityProof
    ) {
      status
      message
    }
  }
`;
