import gql from 'graphql-tag';

export const SEARCH_USER = gql`
  query SearchUser($search: String!, $limit: Int, $page: Int) {
    searchUser(search: $search, limit: $limit, page: $page) {
      docs {
        _id
        email
        last_name
        first_name
      }
    }
  }
`;
