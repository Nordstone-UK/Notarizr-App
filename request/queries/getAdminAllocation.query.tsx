import { gql } from "@apollo/client";

export const GET_ADMIN_ALLOCATIONS = gql`
  query GetAdminAllocations($agentRequestStatus: String!, $page: Int!, $pageSize: Int!) {
    getAdminAllocations(agentResquesStatus: $agentRequestStatus, page: $page, pageSize: $pageSize) {
      status
      message
      totalDocs
      limit
      totalPages
      page
      pagingCounter
      hasPrevPage
      hasNextPage
      prevPage
      nextPage
      allocation {
        _id
        first_name
        last_name
        email
        phone
        adminId
        allocatedBy
        preferredDate
        preferredTime
        address
        status
        
        agentResquesStatus
        createdAt
        updatedAt
        service {
          _id
          service_type
        }
      }
    }
  }
`;
