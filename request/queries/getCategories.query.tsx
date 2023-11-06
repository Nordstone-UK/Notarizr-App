import gql from 'graphql-tag';

export const GET_CATEGORIES = gql`
  query GetCategories {
    getCategories {
      status
      message
      categories {
        _id
        name
        status
        document {
          _id
          name
          price
          image
          createdAt
          updatedAt
          statePrices {
            state
            price
          }
        }
        createdAt
        updatedAt
      }
    }
  }
`;
