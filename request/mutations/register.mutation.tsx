import gql from 'graphql-tag';

export const REGISTER_USER = gql`
  mutation Register(
    $firstName: String!
    $lastName: String!
    $email: String!
    $phoneNumber: String!
    $location: String!
    $accountType: String
    $photoId: String
    $certificateUrl: String
    $profilePicture: String
    $gender: String
    $description: String
    $state: String
    $notarySeal: String
    $dateOfBirth: String
  ) {
    register(
      first_name: $firstName
      last_name: $lastName
      email: $email
      phone_number: $phoneNumber
      location: $location
      account_type: $accountType
      photoId: $photoId
      certificate_url: $certificateUrl
      profile_picture: $profilePicture
      gender: $gender
      description: $description
      state: $state
      notarySeal: $notarySeal
      date_of_birth: $dateOfBirth
    ) {
      message
      status
      access_token
      id
    }
  }
`;
