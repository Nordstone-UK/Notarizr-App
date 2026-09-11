import gql from 'graphql-tag';

export const CREATE_BOOKING = gql`
  mutation CreateBookingR(
    $serviceType: String!
    $service: String
    $agent: String
    $assignmentCoordinates: [Float!]
    $appointmentTimezone: String
    $documentType: [DocsTypeInput!]!
    $address: String
    $dateOfBooking: Date
    $timeOfBooking: Date
    $notes: String
    $bookingType: String
    $bookedFor: BookedForInput
    $preferenceAnalysis: String
    $documents: JSON
    $totalPrice: Float
    $totalSignaturesRequired: Int!
    $useStandardPricing: Boolean
    $additionalSeals: Int
    $additionalSigners: Int
    $platformProvidedWitnesses: Int
    $customerProvidedWitnesses: Int
    $isClosing: Boolean
    $closingRoute: ClosingRoute
  ) {
    createBookingR(
      service_type: $serviceType
      service: $service
      agent: $agent
      assignment_coordinates: $assignmentCoordinates
      appointment_timezone: $appointmentTimezone
      document_type: $documentType
      address: $address
      date_of_booking: $dateOfBooking
      time_of_booking: $timeOfBooking
      notes: $notes
      booking_type: $bookingType
      booked_for: $bookedFor
      preference_analysis: $preferenceAnalysis
      documents: $documents
      totalPrice: $totalPrice
      total_signatures_required: $totalSignaturesRequired
      useStandardPricing: $useStandardPricing
      additionalSeals: $additionalSeals
      additionalSigners: $additionalSigners
      platformProvidedWitnesses: $platformProvidedWitnesses
      customerProvidedWitnesses: $customerProvidedWitnesses
      isClosing: $isClosing
      closingRoute: $closingRoute
    ) {
      status
      message
      booking {
        _id
        agora_channel_name
        agora_channel_token
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
            schedule {
              day
              slots {
                startTime
                endTime
              }
            }
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
        proof_documents
        rating
        review
        createdAt
        updatedAt
        totalPrice
        price_breakdown {
          path
          billingMode
          lineItems {
            key
            label
            amount
          }
          customerTotal
          agentPayout
          platformMargin
          technologyFee
          estimatedProcessingFee
          configVersion
          calculatedAt
          warnings
        }
      }
    }
  }
`;
