import gql from 'graphql-tag';

const COMPLETED_RECORD_FIELDS = `
  _id
  status
  notarized_docs
  completion_package
  journal_entry
`;

export const COMPLETE_BOOKING_NOTARIZATION = gql`
  mutation CompleteBookingNotarization(
    $bookingId: String!
    $completionPackage: JSON!
    $journalEntry: JSON
    $notarizedDocs: [String!]
  ) {
    completeBookingNotarizationR(
      bookingId: $bookingId
      completion_package: $completionPackage
      journal_entry: $journalEntry
      notarizedDocs: $notarizedDocs
    ) {
      status
      message
      booking {
        ${COMPLETED_RECORD_FIELDS}
      }
    }
  }
`;

export const COMPLETE_SESSION_NOTARIZATION = gql`
  mutation CompleteSessionNotarization(
    $sessionId: String!
    $completionPackage: JSON!
    $journalEntry: JSON
    $notarizedDocs: [String!]
  ) {
    completeSessionNotarizationR(
      sessionId: $sessionId
      completion_package: $completionPackage
      journal_entry: $journalEntry
      notarizedDocs: $notarizedDocs
    ) {
      status
      message
      session {
        ${COMPLETED_RECORD_FIELDS}
      }
    }
  }
`;
