import LocalSearchbar from '@/components/shared/search/LocalSearchbar'
import Filter from '@/components/shared/Filter'
import { QuestionFilters } from '@/constants/filters'
import NoResult from '@/components/shared/NoResult'
import QuestionCard from '@/components/shared/card/QuestionCard'
import { getSavedQuestions } from '@/lib/actions/user.action'
import { auth } from '@clerk/nextjs'

export default async function Page() {
  const { userId } = auth()
  // @ts-ignore
  const result = await getSavedQuestions({clerkId: userId})
  return (
    <>
      <h1 className='h1-bold text-dark100_light900'>我的收藏</h1>

      <div className='mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center'>
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
          result.questions.map((question) => (
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
    </>
  )
}
