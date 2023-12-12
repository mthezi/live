import React from 'react'
import Link from 'next/link'
import Metric from '@/components/shared/Metric'
import { formatLargeNumber, getTimeStamp } from '@/lib/utils'
import { SignedIn } from '@clerk/nextjs'
import EditDeleteAction from '../EditDeleteAction'

interface AnswerCardProps {
  _id: string
  title: string
  tags: {
    _id: string
    name: string
  }[]
  questionId: string
  author: {
    _id: string
    clerkId: string
    name: string
    picture: string
  }
  upvotes: string[]
  createdAt: Date
  clerkId?: string
}

const AnswerCard = ({
  _id,
  title,
  questionId,
  author,
  upvotes,
  createdAt,
  clerkId
}: AnswerCardProps) => {
  const showActionButtons = clerkId && author.clerkId === clerkId

  return (
    <div className='card-wrapper rounded-[10px] p-9 sm:px-11'>
      <div className='flex flex-col-reverse items-start justify-between gap-5 sm:flex-row'>
        <div>
          <span className='subtle-regular text-dark400_light700 line-clamp-1 flex sm:hidden'>
            {getTimeStamp(createdAt)}
          </span>
          <Link href={`/question/${questionId}/#${_id}`}>
            <h3 className='sm:h3-semibold base-semibold text-dark200_light900 line-clamp-1 flex-1'>
              {title}
            </h3>
          </Link>
        </div>
        <SignedIn>
          {showActionButtons && (
            <EditDeleteAction
              type='answer'
              itemId={JSON.stringify(_id)}
            />
          )}
        </SignedIn>
      </div>
      <div className='flex-between mt-6 w-full flex-wrap gap-3'>
        <Metric
          imgUrl={author.picture}
          alt='用户'
          value={author.name}
          title={` · ${getTimeStamp(createdAt)} 提问`}
          href={`/profile/${author._id}`}
          isAuthor
          textStyles='body-medium text-dark400_light700'
        />

        <Metric
          imgUrl='/assets/icons/like.svg'
          alt='点赞'
          value={formatLargeNumber(upvotes.length)}
          title='点赞'
          textStyles='small-medium text-dark400_light800'
        />
      </div>
    </div>
  )
}

export default AnswerCard
