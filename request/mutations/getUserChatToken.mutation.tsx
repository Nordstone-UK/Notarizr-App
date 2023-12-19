import gql from 'graphql-tag';

export const GET_CHAT_TOKEN = gql`
  mutation GetUserChatToken {
    getUserChatToken {
      status
      token
    }
  }
`;
