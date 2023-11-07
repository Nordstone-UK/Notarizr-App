import gql from 'graphql-tag';

export const FETCH_USER_INFO = gql`
  query User {
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
      current_location {
        type
        coordinates
      }
      description
      state
      addresses {
        tag
        location
      }
    }
  }
`;
