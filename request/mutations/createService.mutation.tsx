import gql from 'graphql-tag';

export const CREATE_SERVICE = gql`
  mutation CreateService(
    $name: String!
    $serviceType: String!
    $availability: AvailabilityInput!
    $location: [String!]!
  ) {
    createService(
      name: $name
      service_type: $serviceType
      availability: $availability
      location: $location
    ) {
      status
      message
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
    }
  }
`;
