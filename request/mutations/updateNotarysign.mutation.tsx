import gql from 'graphql-tag';

export const UPDATE_NOTARY_SIGN = gql`
  mutation UpdateNotarySigns($notarysigns: [UpdateNotarySignInput]!) {
    updateNotarySigns(notarysigns: $notarysigns) {
      status
      message
    }
  }
`;
