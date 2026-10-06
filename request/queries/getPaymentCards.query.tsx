import gql from 'graphql-tag';

export const GET_PAYMENT_CARDS = gql`
  query GetPaymentCardsR {
    getPaymentCardsR {
      status
      message
      cards {
        id
        brand
        last4
        exp_month
        exp_year
        funding
      }
    }
  }
`;
