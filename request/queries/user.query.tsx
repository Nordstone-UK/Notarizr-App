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
      subscriptionType
      isVerified
      account_type
    }
  }
`;
