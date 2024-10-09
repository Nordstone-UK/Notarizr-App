import { gql } from '@apollo/client';

export const GET_NOTIFICATIONS_BY_ID = gql`
  query getNotificationById($receiverId: String!, $page: Int!, $limit: Int!) {
    getNotificationById(receiverId: $receiverId, page: $page, limit: $limit) {
      notifications {
        _id
        title
        description
        status
        triggerDateTime
         sender_id
        receiver_id
        createdAt
        updatedAt
      }
    }
  }
`;
