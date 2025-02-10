import { gql } from '@apollo/client'

export const GET_FAQS = gql`
  query GetAllFAQS {
    getAllFAQS {
        _id
        question
        answer
        priority
      
    }
  }
`;

export const CREATE_FAQ = gql`
  mutation CreateFaqR($question: String!, $answer: String!, $priority: Int!) {
    createFaqR(question: $question, answer: $answer, priority: $priority) {
      message
      status
      data {
        question
        answer
        priority
      }
    }
  }
`

export const UPDATE_FAQ = gql`
  mutation UpdateFaqR($id: String, $priority: Int, $question: String, $answer: String) {
    updateFaqR(_id: $id, priority: $priority, question: $question, answer: $answer) {
      message
      status
      data {
        _id
        question
        answer
        priority
      }
    }
  }
`

export const DELETE_FAQ = gql`
  mutation DeleteFaqR($id: String) {
    deleteFaqR(_id: $id) {
      message
      status
      data {
        _id
        question
        answer
        priority
      }
    }
  }
`

export const IS_FAQ_PRIORITY_TAKEN = gql`
  query IsFaqPriorityTaken($priority: Int, $isEdit: Boolean, $faqId: String) {
    isFaqPriorityTaken(priority: $priority, isEdit: $isEdit, faqId: $faqId) {
      status
      isTaken
    }
  }
`
