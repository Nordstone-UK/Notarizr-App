import gql from 'graphql-tag';

export const EDIT_USER_ADDRESS = gql`
 mutation UpdateUserAddressR($location: String!, $tag: String!,$lat: String!,
    $lng: String!, $addressId: String!) {
  updateUserAddressR(location: $location, tag: $tag,lat:$lat,lng:$lng, addressId: $addressId) {
    status
    message
  }
}
`;
