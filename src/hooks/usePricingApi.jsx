import {useCallback} from 'react';
import {useLazyQuery} from '@apollo/client';
import {CALCULATE_PRICE} from '../../request/queries/calculatePrice.query';

// Wraps the server-side pricing engine (calculatePriceR) so screens get an authoritative,
// itemized quote instead of computing totals client-side. See notarizr_backend
// src/services/pricing/pricing.service.ts and src/config/pricing.config.ts for the rules.
const usePricingApi = () => {
  const [calculatePriceQuery, {loading: calculatingPrice}] =
    useLazyQuery(CALCULATE_PRICE);

  // path: 'open_call' | 'invitation'
  // options: {agentTier, billingMode, additionalSeals, additionalSigners,
  //   platformProvidedWitnesses, customerProvidedWitnesses, isClosing, closingRoute, customPrice}
  // Stable identity (useCallback) so callers can safely list it in a useEffect dependency array
  // without triggering a re-fetch loop.
  const calculatePrice = useCallback(
    async (path, options = {}) => {
      try {
        const response = await calculatePriceQuery({
          variables: {path, ...options},
          fetchPolicy: 'network-only',
        });
        return response?.data?.calculatePriceR;
      } catch (error) {
        console.log('calculatePrice error', error);
        return null;
      }
    },
    [calculatePriceQuery],
  );

  return {calculatePrice, calculatingPrice};
};

export default usePricingApi;
