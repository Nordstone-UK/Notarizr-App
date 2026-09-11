import gql from 'graphql-tag';

export const UPDATE_SESSION_PRICEDOCS = gql`
  mutation UpdateSessionR(
    $sessionId: String!
    $price: Float
    $clientDocuments: JSON
    $review: String
    $rating: Int
    $paymentType: String
    $useStandardPricing: Boolean
    $billingMode: InvitationBillingMode
    $additionalSeals: Int
    $additionalSigners: Int
    $platformProvidedWitnesses: Int
    $customerProvidedWitnesses: Int
    $isClosing: Boolean
    $closingRoute: ClosingRoute
    $customPrice: Float
  ) {
    updateSessionR(
      sessionId: $sessionId
      price: $price
      client_documents: $clientDocuments
      review: $review
      rating: $rating
      payment_type: $paymentType
      useStandardPricing: $useStandardPricing
      billingMode: $billingMode
      additionalSeals: $additionalSeals
      additionalSigners: $additionalSigners
      platformProvidedWitnesses: $platformProvidedWitnesses
      customerProvidedWitnesses: $customerProvidedWitnesses
      isClosing: $isClosing
      closingRoute: $closingRoute
      customPrice: $customPrice
    ) {
      session {
        _id
        price
        price_breakdown {
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
        client_documents
        status
        client_email
        observers
        identity_authentication
        session_schedule
        date_time_session
        agent_document
        agora_channel_name
        agora_channel_token
        signature_request_id
        signatures {
          signatureId
          signerName
          signerEmailAddress
          order
          signature_url
        }
        createdAt
        updatedAt
      }
      message
      status
    }
  }
`;
