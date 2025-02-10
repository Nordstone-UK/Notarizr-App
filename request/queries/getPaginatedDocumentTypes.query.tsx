import gql from 'graphql-tag';

export const GET_DOCUMENT_TYPES = gql`
  query GetPaginatedDocumentTypes(
    $page: Int!
    $limit: Int!
    $state: String!
    $searchString: String
  ) {
    getPaginatedDocumentTypes(
      page: $page
      limit: $limit
      state: $state
      search_string: $searchString
    ) {
      status
      message
      documentTypes {
        _id
        name
        image
        createdAt
        updatedAt
        statePrices {
          state
          price
        }
      }
      totalDocs
      limit
      totalPages
      page
      pagingCounter
      hasPrevPage
      hasNextPage
      prevPage
      nextPage
    }
  }
`;
