import gql from 'graphql-tag';

export const CREATE_BOOKING = gql`
  mutation CreateBookingR(
    $serviceType: String!
    $service: String!
    $agent: String!
    $documentType: DocsTypeInput!
    $timeOfBooking: Date
    $dateOfBooking: Date
    $address: String
    $bookedFor: BookedForInput
    $bookingType: String
    $documents: JSON
    $preferenceAnalysis: String
  ) {
    createBookingR(
      service_type: $serviceType
      service: $service
      agent: $agent
      document_type: $documentType
      time_of_booking: $timeOfBooking
      date_of_booking: $dateOfBooking
      address: $address
      booked_for: $bookedFor
      booking_type: $bookingType
      documents: $documents
      preference_analysis: $preferenceAnalysis
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
          category {
            _id
            name
            status
            document {
              _id
              name
              price
              image
              createdAt
              updatedAt
              statePrices {
                state
                price
              }
            }
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
        document_type {
          price
          name
        }
        createdAt
        updatedAt
      }
    }
  }
`;
