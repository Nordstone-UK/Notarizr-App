import gql from 'graphql-tag';

export const UPLOAD_AUTH_USER_ID = gql`
  mutation UploadAuthenticateUsersId(
    $userAccessCode: String!
    $idFront: String!
    $idBack: String!
    $country: Int!
  ) {
    uploadAuthenticateUsersId(
      userAccessCode: $userAccessCode
      idFront: $idFront
      idBack: $idBack
      country: $country
    ) {
      message
      status
    }
  }
`;
