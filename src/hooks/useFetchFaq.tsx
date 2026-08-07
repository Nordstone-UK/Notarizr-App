import {useLazyQuery} from '@apollo/client';
import {useCallback, useEffect, useState} from 'react';
import {Faq} from '../types/faq.types';
import {GET_FAQS} from '../../request/queries/faq.query';

type Response = {
  getAllFAQS?: Faq[];
};

type FetchResponse = {
  faq: Faq[];
  error: boolean;
  loading: boolean;
  refetchFaq: () => Promise<void>;
};

const useFetchFaq = (): FetchResponse => {
  const [faq, setFaq] = useState<Faq[]>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [getAllFaqs] = useLazyQuery<Response>(GET_FAQS, {
    fetchPolicy: 'network-only',
  });

  const fetchFaq = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await getAllFaqs();
      if (Array.isArray(response.data?.getAllFAQS)) {
        setFaq(response.data.getAllFAQS);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [getAllFaqs]);

  const refetchFaq = async () => {
    await fetchFaq();
  };

  useEffect(() => {
    fetchFaq();
  }, [fetchFaq]);

  return {faq, error, loading, refetchFaq};
};

export default useFetchFaq;
