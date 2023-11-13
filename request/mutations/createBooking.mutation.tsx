import gql from 'graphql-tag';

export const CREATE_BOOKING = gql`
  mutation CreateBookingR(
    $serviceType: String!
    $service: String!
    $agent: String!
    $documentType: DocsTypeInput!
    $address: String
    $dateOfBooking: Date
    $timeOfBooking: Date
    $notes: String
    $bookedFor: BookedForInput
    $bookingType: String
    $preferenceAnalysis: String
    $documents: JSON
  ) {
    createBookingR(
      service_type: $serviceType
      service: $service
      agent: $agent
      document_type: $documentType
      address: $address
      date_of_booking: $dateOfBooking
      time_of_booking: $timeOfBooking
      notes: $notes
      booked_for: $bookedFor
      booking_type: $bookingType
      preference_analysis: $preferenceAnalysis
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
    }
  }
`;
