import gql from 'graphql-tag';

export const UPDATE_PROFILE_PICTURE = gql`
  mutation Update($profilePicture: String!) {
    update(profile_picture: $profilePicture) {
      message
      status
    }
  }
`;
