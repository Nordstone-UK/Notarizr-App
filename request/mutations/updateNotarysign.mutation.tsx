import gql from 'graphql-tag';

export const UPDATE_NOTARY_SIGN = gql`
  mutation UpdateNotarySigns($notarysigns: [UpdateNotarySignInput]!) {
    updateNotarySigns(notarysigns: $notarysigns) {
      status
      message
    }
  }
`;
export const UPDATE_AGENT_PHOTO_AND_CERTIFICATE = gql`
  mutation UpdateAgentPhotoAndCertificate($photoId: String!, $certificate_url: String!) {
    updateAgentPhotoAndCertificate(photoId: $photoId, certificate_url: $certificate_url) {
      message
      status
    }
  }
`;

export const UPDATE_NOTARY_SEAL = gql`
  mutation UpdateNotarySeal($notarySeal: String!) {
    updateNotarySeal(notarySeal: $notarySeal) {
      message
      status
    }
  }
`;