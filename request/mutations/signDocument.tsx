import gql from 'graphql-tag';

export const SIGN_DOCS = gql`
  mutation UpdateDocumentsByDocId(
    $bookingId: String!
    $documentId: String!
    $documents: JSON
  ) {
    updateDocumentsByDocId(
      bookingId: $bookingId
      documentId: $documentId
      documents: $documents
    ) {
      status
      message
      document {
        _id
        name
        url
      }
    }
  }
`;
