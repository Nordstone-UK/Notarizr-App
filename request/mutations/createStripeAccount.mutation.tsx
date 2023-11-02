import gql from 'graphql-tag';

export const CREATE_STRIPE_ACCOUNT = gql`
  mutation CreateStripeAccount {
    createStripeAccount {
      status
      message
    }
  }
`;
