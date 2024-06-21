import gql from 'graphql-tag';

export const GET_PAYMENT_INTENTS = gql`
  query GetPaymentIntents {
    getPaymentIntents(limit: 20, page: null) {
      status
      message
      hasNextPage
      next_page
      transactions {
        _id
        status
        currency
        transaction_id
        amount
        service_type
        createdAt
        updatedAt
        client {
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
        }
      }
    }
  }
`;
