import { getUserAnswers } from '@/lib/actions/user.action'
import { SearchParamsProps } from '@/types'
import React from 'react'
import AnswerCard from './card/AnswerCard'
import Pagination from '@/components/shared/Pagination'

interface AnswerTabProps extends SearchParamsProps {
  userId: string
  clerkId?: string
}

const AnswerTab = async ({
  searchParams,
  userId,
  clerkId,
}: AnswerTabProps) => {
  const result = await getUserAnswers({
    userId,
    page: searchParams.page ? +searchParams.page : 1,
    pageSize: 5,
  })
  return (
    <>
      {result.answers.map((answer) => (
        <AnswerCard
          key={answer._id}
          _id={answer._id}
          questionId={answer.question._id}
          clerkId={clerkId}
          title={answer.question.title}
          tags={answer.tags}
          author={answer.author}
          upvotes={answer.upvotes}
          createdAt={answer.createdAt}
        />
      ))}
      <div className='mt-10'>
        <Pagination
          pageNumber={searchParams?.page ? +searchParams.page : 1}
          isNext={result.isNext}
        />
      </div>
    </>
  )
}

export default AnswerTab
