import gql from 'graphql-tag';

export const GET_BOOKING = gql`
  query GetBookings {
    getBookings {
      status
      message
      bookings {
        _id
        booked_by {
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
        }
        service_type
        address
        landmark
        date_of_booking
        time_of_booking
        notes
        agent {
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
        }
        preference_analysis
        status
        documents
        createdAt
        updatedAt
        service {
          status
        }
      }
    }
  }
`;
