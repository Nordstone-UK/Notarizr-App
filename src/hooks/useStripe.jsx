import {GET_STRIPE_ONBOARDING_LINK} from '../../request/queries/getOnboardingLink.query';

const {useMutation, useLazyQuery} = require('@apollo/client');
const {
  CREATE_STRIPE_ACCOUNT,
} = require('../../request/mutations/createStripeAccount.mutation');

const useStripe = () => {
  const [createStripeAccount] = useMutation(CREATE_STRIPE_ACCOUNT);
  const [getOnboardingLink] = useLazyQuery(GET_STRIPE_ONBOARDING_LINK);
  const handleStripeCreation = async () => {
    try {
      const response = await createStripeAccount();
      console.log('response', response);
      if (response?.data?.createStripeAccount?.status) {
        const response = await handleOnboardingLink();
        // console.log('In API link', response);
        return response;
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleOnboardingLink = async () => {
    try {
      const response = await getOnboardingLink();
      console.log('response', response);
      console.log('response', response?.data?.getOnboardingLink?.account_link);
      return response?.data?.getOnboardingLink?.account_link;
    } catch (error) {
      console.log('error', error);
    }
  };
  return {handleStripeCreation};
};

export default useStripe;
