import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 sm:px-6 lg:px-8'>
      <SignIn />
    </div>
  )
}
