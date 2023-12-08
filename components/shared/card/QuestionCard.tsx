import React from 'react'
import Link from 'next/link'
import RenderTag from '@/components/shared/RenderTag'
import Metric from '@/components/shared/Metric'
import { formatLargeNumber, getTimeStamp } from '@/lib/utils'

interface QuestionCardProps {
  _id: string
  title: string
  description: string
  tags: {
    _id: string
    name: string
  }[]
  author: {
    _id: string
    name: string
    picture: string
  }
  upvotes: string[]
  views: number
  answers: Array<object>
  createdAt: Date
}

const QuestionCard = ({
  _id,
  title,
  tags,
  author,
  upvotes,
  views,
  answers,
  createdAt,
}: QuestionCardProps) => {
  return (
    <div className='card-wrapper rounded-[10px] p-9 sm:px-11'>
      <div className='flex flex-col-reverse items-start justify-between gap-5 sm:flex-row'>
        <div>
          <span className='subtle-regular text-dark400_light700 line-clamp-1 flex sm:hidden'>
            {getTimeStamp(createdAt)}
          </span>
          <Link href={`question/${_id}`}>
            <h3 className='sm:h3-semibold base-semibold text-dark200_light900 line-clamp-1 flex-1'>
              {title}
            </h3>
          </Link>
        </div>
      </div>
      <div className='mt-3.5 flex flex-wrap gap-2'>
        {tags.map((tag) => (
          <RenderTag key={tag._id} _id={tag._id} name={tag.name} />
        ))}
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
        <Metric
          imgUrl='/assets/icons/message.svg'
          alt='评论'
          value={formatLargeNumber(answers.length)}
          title='评论'
          textStyles='small-medium text-dark400_light800'
        />
        <Metric
          imgUrl='/assets/icons/eye.svg'
          alt='浏览'
          value={formatLargeNumber(views)}
          title='浏览'
          textStyles='small-medium text-dark400_light800'
        />
      </div>
    </div>
  )
}

export default QuestionCard
