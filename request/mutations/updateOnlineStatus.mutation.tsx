import gql from 'graphql-tag';

export const UPDATE_ONLINE_STATUS = gql`
  mutation UpdateOnlineStatusR($onlineStatus: String!) {
    updateOnlineStatusR(online_status: $onlineStatus) {
      status
      message
      user {
        _id
        first_name
        last_name
        email
        phone_number
        profile_picture
        gender
        isBlocked
        chatPrivacy
        location
        rating
        subscriptionType
        isVerified
        account_type
        online_status
      }
    }
  }
`;
