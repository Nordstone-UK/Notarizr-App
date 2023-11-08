import gql from 'graphql-tag';

export const UPDATE_USER_ADDRESS = gql`
  mutation UpdateUserAddresses($location: String!, $tag: String!) {
    updateUserAddresses(location: $location, tag: $tag) {
      message
      status
    }
  }
`;
