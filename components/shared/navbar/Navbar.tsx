import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { SignedIn, UserButton } from '@clerk/nextjs'
import Theme from '@/components/shared/navbar/Theme'
import MobileNavbar from '@/components/shared/navbar/MobileNavbar'
import GlobalSearch from '@/components/shared/search/GlobalSearch'

const Navbar = () => {
  return (
    <nav className='flex-between background-light900_dark200 fixed z-50 w-full gap-5 border-b-2 border-light-800 p-6 shadow-light-200 dark:border-none dark:shadow-none sm:px-12'>
      <Link href='/' className='flex cursor-pointer items-center gap-1'>
        <Image
          src='/assets/images/site-logo.svg'
          width={18}
          height={18}
          alt='码上人生Logo'
        />
        <p className='h2-bold  text-dark-100 dark:text-light-900 max-sm:hidden'>
          <span className='text-primary-500'>码</span>上人生
        </p>
      </Link>
      <GlobalSearch />
      <div className='flex-between gap-5'>
        <Theme />
        <SignedIn>
          <UserButton
            afterSignOutUrl='/'
            appearance={{
              elements: {
                avatarBox: 'h-10 w-10',
              },
              variables: {
                colorPrimary: '#ff7000',
              },
            }}
          />
        </SignedIn>
        <MobileNavbar />
      </div>
    </nav>
  )
}

export default Navbar
