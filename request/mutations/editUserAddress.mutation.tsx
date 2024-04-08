import gql from 'graphql-tag';

export const EDIT_USER_ADDRESS = gql`
 mutation UpdateUserAddressR($location: String!, $tag: String!, $addressId: String!) {
  updateUserAddressR(location: $location, tag: $tag, addressId: $addressId) {
    status
    message
  }
}
`;
