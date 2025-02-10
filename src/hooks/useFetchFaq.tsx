import { useLazyQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { Faq } from '../types/faq.types'
import { GET_FAQS } from '../../request/queries/faq.query'

type MainData = {
  status?: string
  message?: string
  data?: Faq
}

type Response = {
  getFaq: MainData
  loading: boolean
}

type FetchResponse = {
  faq: Faq | any
  error: boolean
  loading: boolean
  refetchFaq: () => void
}

const useFetchFaq = (): FetchResponse => {
  const [faq, setFaq] = useState<Faq>()
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)
  const [GetAllFAQS, { data, error: queryError, loading: queryLoading }] = useLazyQuery<Response>(GET_FAQS)
  const fetchFaq = async () => {
    setLoading(true)
    try {
      const res = await GetAllFAQS()
      if (res?.data?.getAllFAQS) {
        setFaq(res.data.getAllFAQS)
      } else {
        setError(true)
      }
    } catch (error) {
      setLoading(false)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  const refetchFaq = async () => {
    await fetchFaq()
  }

  useEffect(() => {
    fetchFaq()
  }, [])
  return { faq, error, loading, refetchFaq }
}

export default useFetchFaq
