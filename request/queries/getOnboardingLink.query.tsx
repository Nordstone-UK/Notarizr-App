import gql from 'graphql-tag';

export const GET_STRIPE_ONBOARDING_LINK = gql`
  query GetOnboardingLink {
    getOnboardingLink {
      status
      message
      account_link
    }
  }
`;
