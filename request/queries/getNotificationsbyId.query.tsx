import {gql} from '@apollo/client';

export const GET_NOTIFICATIONS_BY_ID = gql`
  query getNotificationById($page: Int!, $limit: Int!) {
    getNotificationById(page: $page, limit: $limit) {
      notifications {
        _id
        title
        description
        status
        isRead
        triggerDateTime
        sender_id
        receiver_id
        createdAt
        updatedAt
      }
      unreadCount
    }
  }
`;

export const MARK_NOTIFICATION_READ = gql`
  mutation MarkNotificationRead($notificationId: String!) {
    markNotificationRead(notificationId: $notificationId) {
      status
      notification {
        _id
        isRead
      }
    }
  }
`;

export const MARK_ALL_NOTIFICATIONS_READ = gql`
  mutation MarkAllNotificationsRead {
    markAllNotificationsRead {
      status
      notifications {
        _id
        isRead
      }
    }
  }
`;
