import gql from 'graphql-tag';

export const CREATE_LOCAL_NOTARY_BOOKING = gql`
  mutation CreateBookingR(
    $serviceType: String!
    $service: String!
    $agent: String!
    $documentType: DocsTypeInput!
    $dateOfBooking: Date
    $timeOfBooking: Date
  ) {
    createBookingR(
      service_type: $serviceType
      service: $service
      agent: $agent
      document_type: $documentType
      date_of_booking: $dateOfBooking
      time_of_booking: $timeOfBooking
    ) {
      status
      message
      booking {
        _id
        service_type
        address
        landmark
        date_of_booking
        time_of_booking
        notes
        preference_analysis
        status
        documents
        createdAt
        updatedAt
      }
    }
  }
`;
