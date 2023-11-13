import gql from 'graphql-tag';

export const GET_MATCHED_AGENT = gql`
  query MatchAgent($serviceType: String!) {
    matchAgent(serviceType: $serviceType) {
      status
      message
      user {
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
        state
        distance
        current_location {
          type
          coordinates
        }
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
        }
      }
    }
  }
`;
