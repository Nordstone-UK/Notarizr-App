import gql from 'graphql-tag';

export const IS_USER_STRIPE_ONBOARD = gql`
  query IsUserStripeOnboard {
    isUserStripeOnboard {
      has_stripe_account
      has_details_submitted
      status
      message
    }
  }
`;
