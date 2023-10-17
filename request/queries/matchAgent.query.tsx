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
      }
    }
  }
`;
