import React from 'react'
import Question from '@/components/forms/Question'
// import { auth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { getUserById } from '@/lib/actions/user.action'

const Page = async () => {
  // const { userId } = auth()
  // console.log(userId)
  const userId = '958f1110-1c9a-404b-862b-990a86094dc3'
  if (!userId) {
    redirect('/sign-in')
  }

  const mongoUser = await getUserById({ userId })

  console.log(mongoUser)

  return (
    <div>
      <h1 className='h1-bold text-dark100_light900'>提出问题</h1>
      <div className='mt-9'>
        <Question mongoUserId={JSON.stringify(mongoUser._id)} />
      </div>
    </div>
  )
}

export default Page
