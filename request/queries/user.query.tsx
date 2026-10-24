import gql from 'graphql-tag';

export const FETCH_USER_INFO = gql`
  query User {
    user {
      _id
      date_of_birth
      first_name
      last_name
      email
      phone_number
      profile_picture
      gender
      isBlocked
      chatPrivacy
      notarySeal
      photoId
      certificate_url
      notaryOnboarding {
        approvalStatus
        submittedAt
        reviewedAt
        reviewedBy
        reviewNotes
        commission {
          state
          county
          city
          zipCode
          number
          issueDate
          expirationDate
          ronStatus
        }
        credentials {
          photoId
          commissionCertificate
          ronApproval
          bond
          insurance
          training
        }
        assets {
          signature
          eSeal
          digitalCertificate
          certificateForms
        }
      }
      clientVerification {
        status
        provider
        providerStatus
        providerReference
        documentType
        documentFrontUrl
        documentBackUrl
        faceImageUrl
        submittedAt
        verifiedAt
        failureReason
      }
      agentPlan {
        tier
        status
        billingProvider
      }
      notarysigns {
        signUrl
        _id
      }
      location
      rating
      subscriptionType
      isVerified
      account_type
      online_status
      current_location {
        type
        coordinates
      }
      description
      state
      zipCode
      addresses {
        _id
        tag
        location
        zipCode
        location_coordinates
      }
      registered_for
    }
  }
`;
