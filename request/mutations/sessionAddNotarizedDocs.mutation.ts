import gql from 'graphql-tag';

export const SESSION_ADD_NOTARIZED_DOCS = gql`
  mutation SessionAddNotarizedDocs(
    $sessionId: String!
    $notarizedDocs: [String!]!
  ) {
    sessionAddNotarizedDocs(
      sessionId: $sessionId
      notarizedDocs: $notarizedDocs
    ) {
      status
      message
      session {
        _id
        notarized_docs
      }
    }
  }
`;
