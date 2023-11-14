import {CREATE_PAYMENT_INTENT} from '../../request/mutations/createPaymentIntent.mutation';
import {GET_STRIPE_ONBOARDING_LINK} from '../../request/queries/getOnboardingLink.query';

const {useMutation, useLazyQuery} = require('@apollo/client');
const {
  CREATE_STRIPE_ACCOUNT,
} = require('../../request/mutations/createStripeAccount.mutation');

const useStripeApi = () => {
  const [createStripeAccount] = useMutation(CREATE_STRIPE_ACCOUNT);
  const [getOnboardingLink] = useLazyQuery(GET_STRIPE_ONBOARDING_LINK);
  const [createPaymentIntent] = useMutation(CREATE_PAYMENT_INTENT);
  const handleStripeCreation = async () => {
    try {
      const response = await createStripeAccount();
      console.log('response', response.data);
      if (response?.data?.createStripeAccount?.status) {
        const response = await handleOnboardingLink();
        console.log('====================================');
        console.log('onbaordingLink', response.data);
        console.log('====================================');
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
  const fetchPaymentSheetParams = async (amount, bookingId) => {
    const request = {
      variables: {
        amount,
        bookingId,
      },
    };
    // console.log('Before Payment Intent: ', request);
    try {
      const response = await createPaymentIntent(request);
      // console.log('Got Payment Intent: ', response);
      return response;
    } catch (error) {
      console.error(error);
    }
  };
  return {handleStripeCreation, fetchPaymentSheetParams, handleOnboardingLink};
};

export default useStripeApi;
