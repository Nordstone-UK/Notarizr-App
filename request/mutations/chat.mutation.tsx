import gql from 'graphql-tag';

export const SAVE_MESSAGE = gql`
  mutation SaveMessage($chatId: String!, $text: String!, $receiverId: String!) {
    saveMessage(chatID: $chatId, text: $text, receiverId: $receiverId) {
      _id
      text
      createdAt
      user {
        _id
        first_name
        last_name
      }
    }
  }
`;

export const MARK_CHAT_READ = gql`
  mutation MarkChatRead($chatId: String!) {
    markChatRead(chatID: $chatId) {
      _id
      isRead
      isReadSendTo {
        _id
      }
    }
  }
`;
