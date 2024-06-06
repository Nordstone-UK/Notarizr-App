import gql from 'graphql-tag';

export const UPDATE_OR_CREATE_SESSION_UPDATED_DOCS = gql`
  mutation UpdateUpdatedDocumentR(
    $sessionId: String!
    $updatedDocuments:[ClientDocsType!]!
  ) {
    updateUpdatedDocumentR(
      sessionId: $sessionId
     updatedDocuments: $updatedDocuments
    ) {
      message
      status
    }
  }
`;