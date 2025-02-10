import { gql } from '@apollo/client';

export const DELETE_ACCOUNT = gql`
  mutation DeleteUserR($userId: String!) {
    deleteUserR(userId: $userId) {
      status
      message
    }
  }
`;
