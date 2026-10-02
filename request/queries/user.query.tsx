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
      addresses {
        _id
        tag
        location
        location_coordinates
      }
      registered_for
      userAccessCode
    }
  }
`;
