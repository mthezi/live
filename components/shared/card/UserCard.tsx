import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getTopInteractedTags } from '@/lib/actions/tag.action'
import RenderTag from '@/components/shared/RenderTag'

interface UserCardProps {
  user: {
    _id: string
    clerkId: string
    name: string
    username: string
    picture: string
  }
}

const UserCard = async ({ user }: UserCardProps) => {
  const { tagsWithNums: tags } = await getTopInteractedTags({
    userId: user._id,
    limit: 3,
  })

  console.log('tags', tags)

  return (
    <div className='shadow-light100_darknone w-full max-xs:min-w-full xs:w-[260px]'>
      <article className='background-light900_dark200 light-border flex w-full flex-col items-center justify-center rounded-2xl border p-8'>
        <Link href={`/profile/${user.clerkId}`}>
          <Image
            src={user.picture}
            alt='用户头像'
            width={100}
            height={100}
            className='rounded-full'
          />
        </Link>
        <div className='mt-4 text-center'>
          <h3 className='h3-bold text-dark200_light900 line-clamp-1'>
            {user.name}
          </h3>
          <p className='body-regular text-dark500_light500 mt-2'>
            {user.username}
          </p>
        </div>
        <div className='mt-5'>
          {tags.length > 0 ? (
            <div className='flex items-center gap-2'>
              {tags.map((tag) => (
                <RenderTag
                  href={`/tags/${tag._id}?userId=${user.clerkId}`}
                  key={tag._id}
                  _id={tag._id || ''}
                  name={tag.name || ''}
                  showCount
                  countVariant='absolute'
                  totalQuestions={tag.nums}
                />
              ))}
            </div>
          ) : (
            <div className='flex items-center gap-2'>
              <RenderTag
                href={`/profile/${user.clerkId}`}
                _id={user.clerkId || ''}
                name={'暂无标签'}
              />
            </div>
          )}
        </div>
      </article>
    </div>
  )
}

export default UserCard
