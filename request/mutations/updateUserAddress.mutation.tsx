import gql from 'graphql-tag';

export const UPDATE_USER_ADDRESS = gql`
  mutation UpdateUserAddresses($location: String!, $tag: String!, $lat: String!, $lng: String!) {
    updateUserAddresses(location: $location, tag: $tag, lat: $lat, lng: $lng) {
      message
      status
    }
  }
`;
