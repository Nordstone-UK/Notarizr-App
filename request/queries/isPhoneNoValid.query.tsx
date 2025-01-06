import gql from 'graphql-tag';

export const IS_MOBILENO_VALID = gql`
  query IsMobileNoValid($phoneNumber: String!) {
    isMobileNoValid(phone_number: $phoneNumber) {
      status
      phoneNoTaken
    }
  }
`;

