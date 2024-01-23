import gql from 'graphql-tag';

export const UPDATE_BOOKING_PRICE = gql`
  mutation UpdateBookingsInfo(
    $bookingId: String!
    $proofDocuments: JSON
    $review: String
    $rating: Int
    $notes: String
    $totalPrice: Float
    $documents: JSON
  ) {
    updateBookingsInfo(
      bookingId: $bookingId
      proof_documents: $proofDocuments
      review: $review
      rating: $rating
      notes: $notes
      totalPrice: $totalPrice
      documents: $documents
    ) {
      status
      message
      booking {
        _id
        booked_by {
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
          userAccessCode
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
          can_print
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
        }
        preference_analysis
        observers
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
        proof_documents
        rating
        review
        createdAt
        updatedAt
        totalPrice
        agora_channel_name
        agora_channel_token
        signature_request_id
        signatures {
          signatureId
          signerName
          signerEmailAddress
          order
          signature_url
        }
      }
    }
  }
`;
