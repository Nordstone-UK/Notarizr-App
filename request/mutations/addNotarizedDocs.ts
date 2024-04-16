import gql from 'graphql-tag';

export const ADD_NOTARIZED_DOCS = gql`
  mutation BookingAddNotarizedDocs(
    $bookingId: String!
    $notarizedDocs: [String!]!
    $bookingType: String!
  ) {
    bookingAddNotarizedDocs(
      bookingId: $bookingId
      notarizedDocs: $notarizedDocs
      bookingType: $bookingType
    ) {
      status
      booking {
        _id
      }
      message
    }
  }
`;
