import gql from 'graphql-tag';

export const CREATE_SERVICE = gql`
  mutation CreateService(
    $name: String!
    $serviceType: String!
    $availability: AvailabilityInput!
    $location: [String!]!
    $canPrint: Boolean!
    $image: String
    $status: String
  ) {
    createService(
      name: $name
      service_type: $serviceType
      availability: $availability
      location: $location
      can_print: $canPrint
      image: $image
      status: $status
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
    }
  }
`;
