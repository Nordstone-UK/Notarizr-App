import { gql } from '@apollo/client';

// Define the mutation
export const UPDATE_VERIFICATION = gql`
  mutation UpdateVerification($_id: String!, $isVerified: Boolean!) {
    updateVerification(_id: $_id, isVerified: $isVerified) {
      _id
      first_name
      last_name
      date_of_birth
      email
      phone_number
      profile_picture
      gender
      isBlocked
      chatPrivacy
      notarySeal
      photoId
      certificate_url
      location
      rating
      subscriptionType
      isVerified
      account_type
      online_status
      description
      state
      userAccessCode
      isSubscribed
      registered_for
    }
  }
`;
