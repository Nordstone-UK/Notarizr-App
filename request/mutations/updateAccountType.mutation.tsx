// src/graphql/mutations.js
import { gql } from '@apollo/client';

export const UPDATE_ACCOUNT_TYPE = gql`
  mutation UpdateAccountType($account_type: String!) {
    updateAccountType(account_type: $account_type) {
      message
      status
    }
  }
`;
