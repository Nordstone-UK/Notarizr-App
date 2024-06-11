import gql from 'graphql-tag';

export const UPDATE_AGENT_CURRENT_LOCATION = gql`
  mutation updateAgentCurrentLocation($lat: String!, $lng: String!) {
    updateAgentcurrentLocation(lat: $lat, lng: $lng) {
      status
      message
    }
  }
`;
