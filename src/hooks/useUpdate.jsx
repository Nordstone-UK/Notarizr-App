import {useMutation} from '@apollo/client';
import {UPDATE_PROFILE_INFO} from '../../request/mutations/updateProfile.mutation';
import {UPDATE_NOTARY_SIGN} from '../../request/mutations/updateNotarysign.mutation';

const useUpdate = () => {
  const [update] = useMutation(UPDATE_PROFILE_INFO);
  const [updateNotarySign] = useMutation(UPDATE_NOTARY_SIGN);
  const handleProfileUpdate = async variables => {
    const request = {
      variables: {
        ...variables,
      },
    };
    console.log('sssssssssssss', request);
    try {
      const response = await update(request);
      console.log('singresdddddddddd', response);
      if (response?.data?.update?.status === '200') {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error(error);
    }
  };
  const handleNotarysignUpdate = async signUrl => {
    try {
      const request = {
        variables: {
          notarysigns: [{signUrl: signUrl}], // Pass an array of objects as expected by the mutation
        },
      };
      const response = await updateNotarySign(request);
      console.log('Notary sign update response:', response);
      return response?.data?.updateNotarySigns?.status === '200';
    } catch (error) {
      console.error('Error updating notary signs:', error);
      return false;
    }
  };

  return {handleProfileUpdate, handleNotarysignUpdate};
};

export default useUpdate;
