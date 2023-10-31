import gql from 'graphql-tag';

export const CREATE_PAYMENT_INTENT = gql`
  mutation CreatePaymentIntentR($amount: Float!, $bookingId: String!) {
    createPaymentIntentR(amount: $amount, bookingId: $bookingId) {
      status
      message
      customer_id
      ephemeralKey
      paymentIntent
    }
  }
`;
