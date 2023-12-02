import gql from 'graphql-tag';

export const GET_ALL_MESSAGES = gql`
  query GetAllMessages($chatId: String!) {
    getAllMessages(chatID: $chatId) {
      _id
      user {
        _id
        first_name
        last_name
      }
      mediaUrl
      chat {
        _id
        users {
          _id
        }
        latestMessage {
          _id
          mediaUrl
          text
          sent
          received
          pending
          createdAt
          user {
            _id
            last_name
            first_name
          }
        }
        isRead
        isReadSendTo {
          _id
          first_name
          last_name
        }
      }
      text
      sent
      received
      pending
      createdAt
    }
  }
`;
