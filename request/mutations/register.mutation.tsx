import gql from 'graphql-tag';

export const REGISTER_USER = gql`
  mutation Register(
    $firstName: String!
    $lastName: String!
    $email: String!
    $phoneNumber: String!
    $location: String!
    $gender: String
    $accountType: String
    $profilePicture: String
    $certificateUrl: String
    $photoId: String
  ) {
    register(
      first_name: $firstName
      last_name: $lastName
      email: $email
      phone_number: $phoneNumber
      location: $location
      gender: $gender
      account_type: $accountType
      profile_picture: $profilePicture
      certificate_url: $certificateUrl
      photoId: $photoId
    ) {
      message
      status
      access_token
      id
    }
  }
`;
