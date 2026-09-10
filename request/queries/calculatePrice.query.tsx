import gql from 'graphql-tag';

// Server-authoritative itemized price quote — see notarizr_backend
// src/services/pricing/pricing.service.ts for the calculation this wraps.
export const CALCULATE_PRICE = gql`
  query CalculatePriceR(
    $path: TransactionPath!
    $agentTier: AgentTier
    $billingMode: InvitationBillingMode
    $additionalSeals: Int
    $additionalSigners: Int
    $platformProvidedWitnesses: Int
    $customerProvidedWitnesses: Int
    $isClosing: Boolean
    $closingRoute: ClosingRoute
    $customPrice: Float
  ) {
    calculatePriceR(
      path: $path
      agentTier: $agentTier
      billingMode: $billingMode
      additionalSeals: $additionalSeals
      additionalSigners: $additionalSigners
      platformProvidedWitnesses: $platformProvidedWitnesses
      customerProvidedWitnesses: $customerProvidedWitnesses
      isClosing: $isClosing
      closingRoute: $closingRoute
      customPrice: $customPrice
    ) {
      path
      billingMode
      lineItems {
        key
        label
        amount
      }
      customerTotal
      agentPayout
      platformMargin
      technologyFee
      estimatedProcessingFee
      configVersion
      calculatedAt
      warnings
    }
  }
`;
