import gql from 'graphql-tag';

export const GET_ALL_CHATS = gql`
  query GetAllChat {
    getAllChat {
      _id
      users {
        _id
        first_name
        last_name
        profile_picture
      }
      latestMessage {
        _id
        mediaUrl
        chat {
          _id
          latestMessage {
            _id
            mediaUrl
            text
            sent
            received
            pending
            createdAt
          }
          isRead
          isReadSendTo {
            _id
          }
        }
        text
        sent
        received
        pending
        createdAt
      }
      isRead
      isReadSendTo {
        _id
      }
    }
  }
`;
