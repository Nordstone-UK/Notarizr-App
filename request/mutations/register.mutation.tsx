import gql from 'graphql-tag';

export const REGISTER_USER = gql`
  mutation Register(
    $firstName: String!
    $lastName: String!
    $email: String!
    $phoneNumber: String!
    $accountType: String
    $photoId: String
    $certificateUrl: String
    $profilePicture: String
    $dateOfBirth: String
    $gender: String
  ) {
    register(
      first_name: $firstName
      last_name: $lastName
      email: $email
      phone_number: $phoneNumber
      account_type: $accountType
      photoId: $photoId
      certificate_url: $certificateUrl
      profile_picture: $profilePicture
      date_of_birth: $dateOfBirth
      gender: $gender
    ) {
      message
      status
      access_token
      id
    }
  }
`;
