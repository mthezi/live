import NoResult from '@/components/shared/NoResult'
import QuestionCard from '@/components/shared/card/QuestionCard'
import LocalSearchbar from '@/components/shared/search/LocalSearchbar'

import { IQuestion } from '@/database/question.model'
import { getQuestionsByTagId } from '@/lib/actions/tag.action'
import { URLProps } from '@/types'
import React from 'react'
import Pagination from '@/components/shared/Pagination'

const page = async ({ params, searchParams }: URLProps) => {
  const result = await getQuestionsByTagId({
    tagId: params.id,
    searchQuery: searchParams.q,
    clerkId: searchParams.userId,
    page: searchParams.page ? +searchParams.page : 1,
    pageSize: 10,
  })
  return (
    <>
      <h1 className='h1-bold text-dark100_light900'>{result.tagTitle}</h1>

      <div className='mt-11 w-full'>
        <LocalSearchbar
          route={`/tags/${params.id}`}
          iconPosition='left'
          imgSrc='/assets/icons/search.svg'
          placeholder='搜索相同标签的问题'
          otherClasses='flex-1'
        />
      </div>
      <div className='mt-10 flex w-full flex-col gap-6'>
        {result.questions.length > 0 ? (
          result.questions.map((question: IQuestion) => (
            <QuestionCard
              key={question._id}
              _id={question._id}
              title={question.title}
              // @ts-ignore
              tags={question.tags}
              // @ts-ignore
              author={question.author}
              // @ts-ignore
              upvotes={question.upvotes}
              views={question.views}
              answers={question.answers}
              createdAt={question.createdAt}
            />
          ))
        ) : (
          <NoResult
            title='没有找到相关问题'
            description='看上去该标签下不包含任何问题，尝试进行提问吧！'
            link='/ask-question'
            linkTitle='尝试进行提问'
          />
        )}
      </div>
      <div className='mt-10'>
        <Pagination
          pageNumber={searchParams?.page ? +searchParams.page : 1}
          isNext={result.isNext}
        />
      </div>
    </>
  )
}

export default page
