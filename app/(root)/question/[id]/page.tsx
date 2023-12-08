import React from 'react'
import { getQuestionById } from '@/lib/actions/question.action'
import Link from 'next/link'
import Image from 'next/image'
import Metric from '@/components/shared/Metric'
import { formatLargeNumber, getTimeStamp } from '@/lib/utils'
import ParseHTML from '@/components/shared/ParseHTML'
import RenderTag from '@/components/shared/RenderTag'
import Answer from '@/components/forms/Answer'
import AllAnswers from '@/components/shared/AllAnswers'
import { auth } from '@clerk/nextjs'
import { getUserById } from '@/lib/actions/user.action'
import Votes from '@/components/shared/Votes'

const Page = async ({
  params,
}: {
  params: {
    id: string
  }
}) => {
  const { userId: clerkId } = auth()
  let mongoUser
  if (clerkId) {
    mongoUser = await getUserById({ userId: clerkId })
  }
  const result = await getQuestionById({ questionId: params.id })
  return (
    <>
      <div className='flex-start w-full flex-col'>
        <div className='flex w-full flex-col-reverse justify-between gap-5 sm:flex-row sm:items-center sm:gap-2'>
          <Link
            href={`/profile/${result.author.clerkId}`}
            className='flex items-center justify-start gap-1'
          >
            <Image
              src={result.author.picture}
              alt='作者头像'
              className='rounded-full'
              width={22}
              height={22}
            />
            <p className='paragraph-semibold text-dark300_light700'>
              {result.author.name}
            </p>
          </Link>
          <div className='flex justify-end'>
            <Votes
              type='question'
              itemId={JSON.stringify(result._id)}
              userId={JSON.stringify(mongoUser._id)}
              upvotes={result.upvotes.length}
              hasupvoted={result.upvotes.includes(mongoUser._id)}
              downvotes={result.downvotes.length}
              hasdownvoted={result.downvotes.includes(mongoUser._id)}
              hasSaved={mongoUser.saved.includes(result._id)}
            />
          </div>
        </div>
        <h2 className='h2-semibold text-dark200_light900 mt-3.5 w-full text-left'>
          {result.title}
        </h2>
      </div>

      <div className='mb-8 mt-5 flex flex-wrap gap-4'>
        <Metric
          imgUrl='/assets/icons/clock.svg'
          alt='时钟图标'
          value={`${getTimeStamp(result.createdAt)} 提问`}
          title=''
          textStyles='small-medium text-dark400_light800'
        />
        <Metric
          imgUrl='/assets/icons/message.svg'
          alt='评论'
          value={formatLargeNumber(result.answers.length)}
          title='评论'
          textStyles='small-medium text-dark400_light800'
        />
        <Metric
          imgUrl='/assets/icons/eye.svg'
          alt='浏览'
          value={formatLargeNumber(result.views)}
          title='浏览'
          textStyles='small-medium text-dark400_light800'
        />
      </div>
      <ParseHTML data={result.content} />
      <div className='mt-8 flex flex-wrap gap-2'>
        {result.tags.map((tag: any) => (
          <RenderTag
            key={tag._id}
            _id={tag._id}
            name={tag.name}
            showCount={false}
          />
        ))}
      </div>

      <AllAnswers
        questionId={result._id}
        userId={mongoUser._id}
        totalAnswers={result.answers.length}
      />

      <Answer
        question={result.content}
        questionId={JSON.stringify(result._id)}
        authorId={JSON.stringify(mongoUser._id)}
      />
    </>
  )
}

export default Page
