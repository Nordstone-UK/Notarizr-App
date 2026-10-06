import gql from 'graphql-tag';

export const CREATE_CARD_SETUP_INTENT = gql`
  mutation CreateCardSetupIntentR {
    createCardSetupIntentR {
      status
      message
      setupIntent
      setup_intent_id
      ephemeralKey
      customer_id
    }
  }
`;

export const REMOVE_PAYMENT_CARD = gql`
  mutation RemovePaymentCardR($paymentMethodId: String!) {
    removePaymentCardR(paymentMethodId: $paymentMethodId) {
      status
      message
    }
  }
`;
