import LocalSearchbar from '@/components/shared/search/LocalSearchbar'
import Filter from '@/components/shared/Filter'
import { QuestionFilters } from '@/constants/filters'
import NoResult from '@/components/shared/NoResult'
import QuestionCard from '@/components/shared/card/QuestionCard'
import { getSavedQuestions } from '@/lib/actions/user.action'
import { auth } from '@clerk/nextjs'
import { SearchParamsProps } from '@/types'
import Pagination from '@/components/shared/Pagination'
import React from 'react'

export default async function Page({ searchParams }: SearchParamsProps) {
  const { userId } = auth()
  const result = await getSavedQuestions({
    clerkId: userId!,
    searchQuery: searchParams.q,
    filter: searchParams.filter,
    page: searchParams.page ? +searchParams.page : 1,
    pageSize: 10,
  })
  return (
    <>
      <h1 className='h1-bold text-dark100_light900'>我的收藏</h1>

      <div
        className='mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center'>
        <LocalSearchbar
          route='/'
          iconPosition='left'
          imgSrc='/assets/icons/search.svg'
          placeholder='搜索问题'
          otherClasses='flex-1'
        />
        <Filter
          filters={QuestionFilters}
          otherClasses='min-h-[56px] sm:min-w-[170px]'
        />
      </div>
      <div className='mt-10 flex w-full flex-col gap-6'>
        {result.questions.length > 0 ? (
          result.questions.map((question: any) => (
            <QuestionCard
              key={question._id}
              _id={question._id}
              title={question.title}
              description={question.description}
              tags={question.tags}
              author={question.author}
              upvotes={question.upvotes}
              views={question.views}
              answers={question.answers}
              createdAt={question.createdAt}
            />
          ))
        ) : (
          <NoResult
            title='没有找到相关问题'
            description='看上去你还没有收藏任何问题，尝试进行提问吧！'
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
