import gql from 'graphql-tag';

export const ADD_OBSERVERS = gql`
  mutation InviteObservers($observers: [String!]!, $bookingId: String!) {
    inviteObservers(observers: $observers, bookingId: $bookingId) {
      status
      message
    }
  }
`;
