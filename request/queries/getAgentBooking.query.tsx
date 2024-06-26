import gql from 'graphql-tag';

export const GET_AGENT_BOOKING = gql`
  query GetAgentBookings($status: String!, $page: Int!, $pageSize: Int!) {
    getAgentBookings(status: $status, page: $page, pageSize: $pageSize) {
      status
      message
      bookings {
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
            _id
            tag
            location
            location_coordinates
          }
          userAccessCode
        }
        client_documents
        agent_document
        notarized_docs
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
        total_signatures_required
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
      totalDocs
      limit
      totalPages
      page
      pagingCounter
      hasPrevPage
      hasNextPage
      prevPage
      nextPage
    }
  }
`;
