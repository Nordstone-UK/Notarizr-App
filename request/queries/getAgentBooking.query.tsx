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
        }
        preference_analysis
        status
        documents
        document_type {
          name
          price
        }
        createdAt
        updatedAt
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
