import gql from 'graphql-tag';

export const UPDATE_PROFILE_INFO = gql`
  mutation Update(
    $firstName: String!
    $lastName: String!
    $phoneNumber: String!
    $profilePicture: String!
    $gender: String!
    $location: String!
  ) {
    update(
      first_name: $firstName
      last_name: $lastName
      phone_number: $phoneNumber
      profile_picture: $profilePicture
      gender: $gender
      location: $location
    ) {
      message
      status
    }
  }
`;
