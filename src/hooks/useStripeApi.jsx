import {CREATE_PAYMENT_INTENT} from '../../request/mutations/createPaymentIntent.mutation';
import {GET_STRIPE_ONBOARDING_LINK} from '../../request/queries/getOnboardingLink.query';
import {IS_USER_STRIPE_ONBOARD} from '../../request/queries/isUserStipeOnboard.query';

const {useMutation, useLazyQuery} = require('@apollo/client');
const {
  CREATE_STRIPE_ACCOUNT,
} = require('../../request/mutations/createStripeAccount.mutation');

const useStripeApi = () => {
  const [createStripeAccount] = useMutation(CREATE_STRIPE_ACCOUNT);
  const [getOnboardingLink] = useLazyQuery(GET_STRIPE_ONBOARDING_LINK);
  const [createPaymentIntent] = useMutation(CREATE_PAYMENT_INTENT);
  const [iseUserStripeOnboard] = useLazyQuery(IS_USER_STRIPE_ONBOARD);
  const handleStripeCreation = async () => {
    try {
      const data = await createStripeAccount();
      if (data?.data?.createStripeAccount?.status) {
        const response = await handleOnboardingLink();

        return response;
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleOnboardingLink = async () => {
    try {
      const response = await getOnboardingLink();
      return response?.data?.getOnboardingLink?.account_link;
    } catch (error) {
      console.log('error', error);
    }
  };
  const fetchPaymentSheetParams = async (amount, bookingId, isSession) => {
    const request = {
      variables: {
        amount: amount,
        createPaymentIntentRId: bookingId,
        isSession: isSession,
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

  const checkUserStipeAccount = async () => {
    try {
      const response = await iseUserStripeOnboard();
      return response?.data;
    } catch (error) {
      console.log(error);
    }
  };
  return {
    handleStripeCreation,
    fetchPaymentSheetParams,
    handleOnboardingLink,
    checkUserStipeAccount,
  };
};

export default useStripeApi;
