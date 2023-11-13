import gql from 'graphql-tag';

export const UPDATE_BOOKING_INFO = gql`
  mutation UpdateBookingsInfo(
    $bookingId: String!
    $proofDocuments: JSON
    $review: String
    $rating: Int
    $notes: String
  ) {
    updateBookingsInfo(
      bookingId: $bookingId
      proof_documents: $proofDocuments
      review: $review
      rating: $rating
      notes: $notes
    ) {
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
        service_type
        service {
          _id
          name
          image
          status
          service_type
          availability {
            weekdays
            startTime
            endTime
          }
          location
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
        preference_analysis
        status
        documents
        booked_for {
          first_name
          last_name
          email
          phone_number
          location
        }
        document_type {
          name
          price
        }
        createdAt
        updatedAt
      }
      message
      status
    }
  }
`;
