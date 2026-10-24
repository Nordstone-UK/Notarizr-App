import gql from 'graphql-tag';

export const UPDATE_MOBILE_NOTARY_STATUS = gql`
  mutation UpdateMobileNotaryStatus($bookingId: String!, $status: String!) {
    updateMobileNotaryStatus(bookingId: $bookingId, status: $status) {
      status
      message
      booking {
        _id
        status
        mobile_notary_status
        mobile_notary_navigation_started_at
        mobile_notary_started_at
        mobile_notary_completed_at
      }
    }
  }
`;
