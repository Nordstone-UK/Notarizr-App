import { gql } from '@apollo/client';

export const ACCEPT_ALLOCATION_REQUEST = gql`
  mutation AcceptAllocationRequest($allocationId: String!) {
    acceptAllocationRequest(allocationId: $allocationId) {
      status
      message
    }
  }
`;

export const REJECT_ALLOCATION_REQUEST = gql`
  mutation RejectAllocationRequest($allocationId: String!) {
    rejectAllocationRequest(allocationId: $allocationId) {
      status
      message
    }
  }
`;
