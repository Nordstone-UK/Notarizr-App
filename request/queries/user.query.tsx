import gql from 'graphql-tag';

export const FETCH_USER_INFO = gql`
  query User {
    user {
      _id
      date_of_birth
      first_name
      last_name
      email
      phone_number
      profile_picture
      gender
      isBlocked
      chatPrivacy
      notarySeal
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
        _id
        tag
        location
       location_coordinates
      }
      userAccessCode
    }
  }
`;
