import { gql } from '@apollo/client';

export const SERVICE_BY_AGENT_AND_TYPE = gql`
  query ServiceByAgentAndType($serviceType: String!) {
    serviceByAgentAndType(serviceType: $serviceType) {
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
        agent {
          _id
        }
      }
    }
  }
`;
