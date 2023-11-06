import {useMutation} from '@apollo/client';
import {UPDATE_PROFILE_INFO} from '../../request/mutations/updateProfile.mutation';

const useUpdate = () => {
  const [update] = useMutation(UPDATE_PROFILE_INFO);
  const handleProfileUpdate = async variables => {
    const request = {
      variables: {
        ...variables,
      },
    };
    console.log(request);
    try {
      const response = await update(request);
      if (response?.data?.update?.status === '200') {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error(error);
    }
  };

  return {handleProfileUpdate};
};

export default useUpdate;
