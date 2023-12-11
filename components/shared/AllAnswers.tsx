import React from 'react'
import Filter from '@/components/shared/Filter'
import { AnswerFilters } from '@/constants/filters'
import { getAnswers } from '@/lib/actions/answer.action'
import Link from 'next/link'
import Image from 'next/image'
import { getTimeStamp } from '@/lib/utils'
import ParseHTML from '@/components/shared/ParseHTML'
import Votes from '@/components/shared/Votes'
import Pagination from '@/components/shared/Pagination'

interface AllAnswersProps {
  questionId: string
  userId: string
  totalAnswers: number
  page?: number | string
  filter?: string
}

const AllAnswers = async ({
  questionId,
  userId,
  totalAnswers,
  page,
  filter,
}: AllAnswersProps) => {
  const result = await getAnswers({
    questionId,
    page: page ? Number(page) : 1,
    pageSize: 10,
    sortBy: filter,
  })
  return (
    <div className='mt-11'>
      <div className='flex items-center justify-between'>
        <h3 className='primary-text-gradient'>{totalAnswers} 个回答</h3>
        <Filter filters={AnswerFilters} />
      </div>
      <div>
        {result.answers.map((answer) => (
          <article
            key={answer._id}
            id={JSON.stringify(answer._id)}
            className='light-border border-b py-10'
          >
            <div className='mb-8 flex flex-col-reverse justify-between gap-5 sm:flex-row sm:items-center sm:gap-2'>
              <Link
                href={`/profile/${answer.author.clerkId}`}
                className='flex flex-1 items-start gap-1 sm:items-center'
              >
                <Image
                  src={answer.author.picture}
                  alt='个人中心'
                  width={18}
                  height={18}
                  className='rounded-full object-cover max-sm:mt-0.5'
                />
                <div className='flex flex-col sm:flex-row sm:items-center'>
                  <p className='body-semibold text-dark300_light700'>
                    {answer.author.name}
                  </p>

                  <p className='small-regular text-light400_light500 mt-0.5 line-clamp-1'>
                    <span className='max-sm:hidden'>·</span>
                    {getTimeStamp(answer.createdAt)} 回答
                  </p>
                </div>
              </Link>
              <div className='flex justify-end'>
                <Votes
                  type='answer'
                  itemId={JSON.stringify(answer._id)}
                  userId={JSON.stringify(userId)}
                  upvotes={answer.upvotes.length}
                  hasupvoted={answer.upvotes.includes(userId)}
                  downvotes={answer.downvotes.length}
                  hasdownvoted={answer.downvotes.includes(userId)}
                />
              </div>
            </div>

            <ParseHTML data={answer.content} />
          </article>
        ))}
      </div>
      <div className='mt-10'>
        <Pagination pageNumber={page ? +page : 1} isNext={result.isNext} />
      </div>
    </div>
  )
}

export default AllAnswers
