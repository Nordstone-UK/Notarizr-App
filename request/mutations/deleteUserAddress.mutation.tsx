import gql from 'graphql-tag';

export const DELETE_USER_ADDRESS = gql`
 mutation DeleteUserAddressR($addressId: String!) {
  deleteUserAddressR(addressId: $addressId) {
    status
    message
  }
}
`;
