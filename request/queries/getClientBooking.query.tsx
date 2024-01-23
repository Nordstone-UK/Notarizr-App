import gql from 'graphql-tag';

export const GET_CLIENT_BOOKING = gql`
  query GetClientBookings($status: String!, $page: Int!, $pageSize: Int!) {
    getClientBookings(status: $status, page: $page, pageSize: $pageSize) {
      status
      message
      bookings {
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
          can_print
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
        proof_documents
        rating
        review
        createdAt
        updatedAt

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
