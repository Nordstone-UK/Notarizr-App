import gql from 'graphql-tag';

export const CREATE_SERVICE = gql`
  mutation CreateService(
    $name: String!
    $serviceType: String!
    $availability: AvailabilityInput!
    $location: String!
    $category: [String!]
  ) {
    createService(
      name: $name
      service_type: $serviceType
      availability: $availability
      location: $location
      category: $category
    ) {
      status
      message
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
          createdAt
          updatedAt
        }
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
          subscriptionType
          isVerified
          account_type
        }
        createdAt
        updatedAt
      }
    }
  }
`;
