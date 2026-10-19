import gql from 'graphql-tag';

export const SUBMIT_CLIENT_IDENTITY_VERIFICATION = gql`
  mutation SubmitClientIdentityVerification(
    $verification: ClientVerificationInput!
  ) {
    submitClientIdentityVerification(verification: $verification) {
      status
      message
      user {
        _id
        clientVerification {
          status
          provider
          providerStatus
          providerReference
          documentType
          documentFrontUrl
          documentBackUrl
          faceImageUrl
          submittedAt
          verifiedAt
          failureReason
        }
      }
    }
  }
`;

export const CREATE_CLIENT_IDENTITY_VERIFICATION_SESSION = gql`
  mutation CreateClientIdentityVerificationSession {
    createClientIdentityVerificationSession {
      status
      message
      verificationUrl
      verificationSessionId
      user {
        _id
        clientVerification {
          status
          provider
          providerStatus
          providerReference
          documentType
          documentFrontUrl
          documentBackUrl
          faceImageUrl
          submittedAt
          verifiedAt
          failureReason
        }
      }
    }
  }
`;

export const REFRESH_CLIENT_IDENTITY_VERIFICATION = gql`
  mutation RefreshClientIdentityVerification {
    refreshClientIdentityVerification {
      status
      message
      user {
        _id
        clientVerification {
          status
          provider
          providerStatus
          providerReference
          documentType
          documentFrontUrl
          documentBackUrl
          faceImageUrl
          submittedAt
          verifiedAt
          failureReason
        }
      }
    }
  }
`;
