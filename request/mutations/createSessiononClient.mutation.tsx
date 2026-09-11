import gql from 'graphql-tag';

export const CREATE_CLIENTSESSION = gql`
  mutation CreateSessionClientR(
    $agentEmail: String!
    $sessionSchedule: String!
    $dateTimeSession: String!
    $useStandardPricing: Boolean
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
    createSessionClientR(
      agent_email: $agentEmail
      session_schedule: $sessionSchedule
      date_time_session: $dateTimeSession
      useStandardPricing: $useStandardPricing
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
        agora_channel_name
        agora_channel_token
        identity_authentication
        payment_type
      }
      message
      status
    }
  }
`;

// export const CREATE_SESSION = gql`
//   mutation CreateSessionR(
//     $clientEmail: String!
//     $sessionSchedule: String!
//     $dateTimeSession: String!
//     $agentDocument: [String!]!
//     $identityAuthentication: String!
//     $observers: [String!]!
//     $price: Float!
//     $documentType: [documentTypeInput!]!
//     $payment_type: String
//   ) {
//     createSessionR(
//       client_email: $clientEmail
//       session_schedule: $sessionSchedule
//       date_time_session: $dateTimeSession
//       agent_document: $agentDocument
//       identity_authentication: $identityAuthentication
//       observers: $observers
//       price: $price
//       document_type: $documentType
//       payment_type: $payment_type
//     ) {
//       session {
//         _id
//         price
//         client_documents
//         status
//         client_email
//         observers
//         identity_authentication
//         session_schedule
//         date_time_session
//         agent_document
//         createdAt
//         updatedAt
//         payment_type
//       }
//       message
//       status
//     }
//   }
//`;
