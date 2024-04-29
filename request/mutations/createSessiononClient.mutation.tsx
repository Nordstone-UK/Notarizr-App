import gql from 'graphql-tag';

export const CREATE_CLIENTSESSION = gql`
  mutation CreateSessionClientR(
    $agentEmail: String!
    $sessionSchedule: String!
    $dateTimeSession: String!
    
  ) {
    createSessionClientR(
      agent_email: $agentEmail
      session_schedule: $sessionSchedule
      date_time_session: $dateTimeSession
     
    ) {
      session {
        _id
        price
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
