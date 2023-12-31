import React from 'react'
import Question from '@/components/forms/Question'
import { auth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { getUserById } from '@/lib/actions/user.action'
import toast from 'react-hot-toast'

const Page = async () => {
  const { userId } = auth()

  if (!userId) {
    toast.error('请先登录')
    redirect('/sign-in')
  }

  const mongoUser = await getUserById({ userId })
  return (
    <div>
      <h1 className='h1-bold text-dark100_light900'>提出问题</h1>
      <div className='mt-9'>
        <Question mongoUserId={JSON.stringify(mongoUser._id)} type='create' />
      </div>
    </div>
  )
}

export default Page
