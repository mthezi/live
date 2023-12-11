import { URLProps } from '@/types'
import React from 'react'
import Image from 'next/image'
import { getUserInfo } from '@/lib/actions/user.action'
import { formatDateToChinese } from '@/lib/utils'
import { SignedIn, auth } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ProfileLink from '@/components/shared/ProfileLink'
import Stats from '@/components/shared/Stats'
import QuestionTab from '@/components/shared/QuestionTab'
import AnswerTab from '@/components/shared/AnswerTab'
import RenderTag from '@/components/shared/RenderTag'

const page = async ({ params, searchParams }: URLProps) => {
  const { userId: clerkId } = auth()
  const userInfo = await getUserInfo({
    userId: params.id,
  })
  return (
    <>
      <div className='flex flex-col-reverse items-start justify-between sm:flex-row'>
        <div className='flex flex-col items-start gap-4 lg:flex-row'>
          <Image
            src={userInfo.user.picture}
            alt='用户头像'
            width={140}
            height={140}
            className='rounded-full object-cover'
          />

          <div className='mt-3'>
            <h2 className='h2-bold text-dark100_light900'>
              {userInfo.user.name}
            </h2>
            <p className='paragraph-regular text-dark200_light800'>
              @{userInfo.user.username}
            </p>

            <div className='mt-5 flex flex-wrap items-center justify-start gap-5'>
              {userInfo.user.portfolioWebsite && (
                <ProfileLink
                  imgUrl='/assets/icons/link.svg'
                  title='我的作品'
                  href={userInfo.user.portfolioWebsite}
                />
              )}
              {userInfo.user.location && (
                <ProfileLink
                  imgUrl='/assets/icons/location.svg'
                  title={userInfo.user.location}
                />
              )}
              <ProfileLink
                imgUrl='/assets/icons/calendar.svg'
                title={formatDateToChinese(userInfo.user.joinedAt)}
              />
            </div>
            {userInfo.user.bio && (
              <p className='paragraph-regular text-dark400_light800 mt-8'>
                {userInfo.user.bio}
              </p>
            )}
          </div>
        </div>
        <div className='flex justify-end max-sm:mb-5 max-sm:w-full sm:mt-3'>
          <SignedIn>
            {clerkId === userInfo.user.clerkId && (
              <Link href='/profile/edit'>
                <Button className='paragraph-medium btn-secondary text-dark300_light900 min-h-[46px] min-w-[175px] px-4 py-3'>
                  编辑个人资料
                </Button>
              </Link>
            )}
          </SignedIn>
        </div>
      </div>
      <Stats
        reputation={userInfo.reputation}
        totalQuestions={userInfo.totalQuestions}
        totalAnswers={userInfo.totalAnswers}
        badgeCounts={userInfo.badgeCounts}
      />
      <div className='mt-10 flex gap-10'>
        <Tabs defaultValue='top-posts' className='flex-1'>
          <TabsList className='background-light800_dark400 min-h-[42px] p-1'>
            <TabsTrigger value='top-posts' className='tab'>
              最佳问题
            </TabsTrigger>
            <TabsTrigger value='answer' className='tab'>
              最新回答
            </TabsTrigger>
          </TabsList>
          <TabsContent value='top-posts' className='flex w-full flex-col gap-6'>
            <QuestionTab
              searchParams={searchParams}
              userId={userInfo.user.id}
              clerkId={clerkId!}
            />
          </TabsContent>
          <TabsContent value='answer' className='flex w-full flex-col gap-6'>
            <AnswerTab
              searchParams={searchParams}
              userId={userInfo.user.id}
              clerkId={clerkId!}
            />
          </TabsContent>
        </Tabs>
        <div className='flex min-w-[278px] flex-col max-lg:hidden'>
          <h3 className='h3-bold text-dark200_light900'>我的标签</h3>
          <div className='mt-7 flex flex-col gap-4'>
            {userInfo.tagsWithNums.map((tag) => (
              <RenderTag
                href={`/tags/${tag._id}/?userId=${userInfo.user.clerkId}`}
                key={tag._id}
                _id={tag._id!}
                name={tag.name!}
                totalQuestions={tag.nums}
                showCount
              />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default page
