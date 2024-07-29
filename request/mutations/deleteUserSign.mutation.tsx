import gql from 'graphql-tag';

export const DELETE_NOTARY_SIGN_MUTATION = gql`
  mutation DeleteNotarySignR($signId: String!) {
    deleteNotarySignR(signId: $signId) {
      status
      message
    }
  }
`;