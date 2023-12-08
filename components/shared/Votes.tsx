'use client'
import { downvoteAnswer, upvoteAnswer } from '@/lib/actions/answer.action'
import { downvoteQuestion, upvoteQuestion } from '@/lib/actions/question.action'
import { toggleSaveQuestion } from '@/lib/actions/user.action'
import { formatLargeNumber } from '@/lib/utils'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import React from 'react'

interface VotesProps {
  type: string
  itemId: string
  userId: string
  upvotes: number
  hasupvoted: boolean
  downvotes: number
  hasdownvoted: boolean
  hasSaved?: boolean
}

const Votes = ({
  type,
  itemId,
  userId,
  upvotes,
  hasupvoted,
  downvotes,
  hasdownvoted,
  hasSaved,
}: VotesProps) => {
  const pathname = usePathname()
  const handleVote = async (action: string) => {
    if (!userId) {
      return
    }
    if (action === 'upvote') {
      if (type === 'question') {
        await upvoteQuestion({
          questionId: JSON.parse(itemId),
          userId: JSON.parse(userId),
          hasupvoted,
          hasdownvoted,
          path: pathname,
        })
      } else if (type === 'answer') {
        await upvoteAnswer({
          answerId: JSON.parse(itemId),
          userId: JSON.parse(userId),
          hasupvoted,
          hasdownvoted,
          path: pathname,
        })
      }
      // TODO: show toast
      return
    }

    if (action === 'downvote') {
      if (type === 'question') {
        await downvoteQuestion({
          questionId: JSON.parse(itemId),
          userId: JSON.parse(userId),
          hasupvoted,
          hasdownvoted,
          path: pathname,
        })
      } else if (type === 'answer') {
        await downvoteAnswer({
          answerId: JSON.parse(itemId),
          userId: JSON.parse(userId),
          hasupvoted,
          hasdownvoted,
          path: pathname,
        })
      }
      // TODO: show toast
      return
    }
  }

  const handleSave = async () => {
    await toggleSaveQuestion({
      userId: JSON.parse(userId),
      questionId: JSON.parse(itemId),
      path: pathname,
    })
  }

  return (
    <div className='flex gap-5'>
      <div className='flex-center gap-2.5'>
        <div className='flex-center gap-1.5'>
          <Image
            src={
              hasupvoted
                ? '/assets/icons/upvoted.svg'
                : '/assets/icons/upvote.svg'
            }
            width={18}
            height={18}
            alt='赞同'
            className='cursor-pointer'
            onClick={() => {
              handleVote('upvote')
            }}
          />

          <div className='flex-center background-light700_dark400 min-w-[18px] rounded-sm p-1'>
            <p>{formatLargeNumber(upvotes)}</p>
          </div>
        </div>
        <div className='flex-center gap-1.5'>
          <Image
            src={
              hasdownvoted
                ? '/assets/icons/downvoted.svg'
                : '/assets/icons/downvote.svg'
            }
            width={18}
            height={18}
            alt='不赞同'
            className='cursor-pointer'
            onClick={() => {
              handleVote('downvote')
            }}
          />

          <div className='flex-center background-light700_dark400 min-w-[18px] rounded-sm p-1'>
            <p>{formatLargeNumber(downvotes)}</p>
          </div>
        </div>
      </div>
      {type === 'question' && (
        <Image
          src={
            hasSaved
              ? '/assets/icons/star-filled.svg'
              : '/assets/icons/star-red.svg'
          }
          width={18}
          height={18}
          alt='收藏'
          className='cursor-pointer'
          onClick={() => {
            handleSave()
          }}
        />
      )}
    </div>
  )
}

export default Votes
