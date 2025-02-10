import { gql } from "@apollo/client";

export const UPDATE_SERVICE_BY_ID = gql`
  mutation UpdateServiceById(
    $id: String!
    $name: String
    $image: String
    $status: String
    $serviceType: String
    $availability: AvailabilityInput
    $location: [String]
    $canPrint: Boolean
  ) {
    updateServiceById(
      id: $id
      name: $name
      image: $image
      status: $status
      service_type: $serviceType
      availability: $availability
      location: $location
      can_print: $canPrint
    ) {
      status
      message
      service {
        _id
        name
        image
        status
        service_type
        location
        can_print
        createdAt
        updatedAt
        availability {
          weekdays
          startTime
          endTime
        }
      }
    }
  }
`;
