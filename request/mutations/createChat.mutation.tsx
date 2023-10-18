import gql from 'graphql-tag';

export const CREATE_CHAT = gql`
  mutation CreateChat($userId: String!) {
    createChat(userID: $userId) {
      chatID
      message
    }
  }
`;
