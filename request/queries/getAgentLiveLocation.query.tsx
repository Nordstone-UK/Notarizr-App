import gql from 'graphql-tag';

export const GET_AGENT_LIVE_LOCATION = gql`
query GetCurrentLocation($userId: String!) {
  getCurrentLocation(userId: $userId) {
     type
    coordinates
  }
}`;
