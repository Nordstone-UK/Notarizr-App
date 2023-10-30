import gql from 'graphql-tag';

export const UPDATE_BOOKING_STATUS = gql`
  mutation UpdateBookingStatusR($bookingId: String!, $status: String!) {
    updateBookingStatusR(bookingId: $bookingId, status: $status) {
      status
      message
      booking {
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
          online_status
        }
        service_type
        service {
          _id
          name
          image
          status
          service_type
          category {
            _id
            name
            status
            createdAt
            updatedAt
          }
          availability {
            weekdays
            startTime
            endTime
          }
          location
          createdAt
          updatedAt
        }
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
          online_status
        }
        preference_analysis
        status
        documents
        document_type {
          name
          price
        }
        createdAt
        updatedAt
      }
    }
  }
`;
