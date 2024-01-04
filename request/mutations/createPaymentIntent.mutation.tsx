import gql from 'graphql-tag';

export const CREATE_PAYMENT_INTENT = gql`
  mutation CreatePaymentIntentR(
    $amount: Float!
    $createPaymentIntentRId: String!
    $isSession: Boolean!
  ) {
    createPaymentIntentR(
      amount: $amount
      id: $createPaymentIntentRId
      is_session: $isSession
    ) {
      status
      message
      paymentIntent
      ephemeralKey
      customer_id
    }
  }
`;
