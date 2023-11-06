import gql from 'graphql-tag';

export const UPDATE_PROFILE_INFO = gql`
  mutation Update(
    $firstName: String!
    $lastName: String!
    $phoneNumber: String!
    $profilePicture: String!
    $location: String!
    $gender: String!
    $description: String!
  ) {
    update(
      first_name: $firstName
      last_name: $lastName
      phone_number: $phoneNumber
      profile_picture: $profilePicture
      location: $location
      gender: $gender
      description: $description
    ) {
      message
      status
    }
  }
`;
