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
        text
        mediaUrl
        createdAt
        user {
          _id
        }
      }
      isRead
      isReadSendTo {
        _id
      }
    }
  }
`;
