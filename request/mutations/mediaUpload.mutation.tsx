import gql from 'graphql-tag';

export const CREATE_MEDIA_UPLOAD = gql`
  mutation CreateMediaUpload(
    $fileName: String!
    $contentType: String!
    $purpose: String!
  ) {
    createMediaUpload(
      fileName: $fileName
      contentType: $contentType
      purpose: $purpose
    ) {
      uploadUrl
      publicUrl
    }
  }
`;
