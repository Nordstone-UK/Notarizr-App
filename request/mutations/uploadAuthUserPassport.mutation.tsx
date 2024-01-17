import gql from 'graphql-tag';

export const UPLOAD_AUTH_USER_PASSPORT = gql`
  mutation UploadAuthenticateUsersPassport(
    $userAccessCode: String!
    $idFront: String!
  ) {
    uploadAuthenticateUsersPassport(
      userAccessCode: $userAccessCode
      idFront: $idFront
    ) {
      message
      status
    }
  }
`;
