import gql from 'graphql-tag';

export const GET_LIVEKIT_ROOM_TOKEN = gql`
  query GetLiveKitRoomToken($recordId: String!) {
    getLiveKitRoomToken(recordId: $recordId) {
      serverUrl
      roomName
      participantIdentity
      token
    }
  }
`;
