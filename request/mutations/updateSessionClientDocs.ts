import gql from 'graphql-tag';

export const UPDATE_SESSION_CLIENT_DOCS = gql`
  mutation sessionUpdateClientDocuments(
    $sessionId: String!
    $key: String!
    $value: String!
  ) {
    sessionUpdateClientDocuments(
      sessionId: $sessionId
      key: $key
      value: $value
    ) {
      session {
        _id
        price
        client_documents
        status
        client_email
        observers
        identity_authentication
        session_schedule
        date_time_session
        agent_document
        createdAt
        updatedAt
      }
      message
      status
    }
  }
`;

export const UPDATE_OR_CREATE_SESSION_CLIENT_DOCS = gql`
  mutation CreateOrUpdateClientDocs(
    $sessionId: String!
    $clientDocuments: [ClientDocsType!]!
  ) {
    createOrUpdateClientDocs(
      sessionId: $sessionId
      clientDocuments: $clientDocuments
    ) {
      session {
        _id
        price
        client_documents
        status
        client_email
        observers
        identity_authentication
        session_schedule
        date_time_session
        agent_document
        createdAt
        updatedAt
      }
      message
      status
    }
  }
`;

export const UPDATE_OR_CREATE_BOOKING_CLIENT_DOCS = gql`
  mutation BookingCreateOrUpdateClientDocs(
    $bookingId: String!
    $clientDocuments: [ClientDocsType!]!
  ) {
    bookingCreateOrUpdateClientDocs(
      bookingId: $bookingId
      clientDocuments: $clientDocuments
    ) {
      status
      message
      booking {
        _id
        client_documents
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
          description
          state
          userAccessCode
          isSubscribed
        }
        agent_document
        notarized_docs
        service_type
        service {
          can_print
          _id
          name
          image
          status
          service_type
          location
          createdAt
          updatedAt
          availability {
            weekdays
            startTime
            endTime
          }
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
            isSubscribed
            current_location {
              type
              coordinates
            }
            addresses {
              _id
              location
              tag
            }
          }
        }
        updatedAt
        totalPrice
        time_of_booking
        status
        signatures {
          signatureId
          signerName
          signerEmailAddress
          order
          signature_url
        }
        signature_request_id
        review
        rating
        proof_documents
        preference_analysis
        observers
        notes
        landmark
        documents
        document_type {
          price
          name
        }
        date_of_booking
        createdAt
        booked_for {
          phone_number
          location
          last_name
          first_name
          email
        }
        agora_channel_token
        agora_channel_name
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
          isSubscribed
        }
        address
      }
    }
  }
`;
