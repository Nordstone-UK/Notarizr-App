import gql from 'graphql-tag';

export const GET_AGORA_CALL_TOKEN = gql`
  query GetAgoraTokenCName($userId: String!) {
    getAgoraTokenCName(userId: $userId) {
      channelName
      token
    }
  }
`;
