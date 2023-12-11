import React from 'react'
import LocalSearchbar from '@/components/shared/search/LocalSearchbar'
import Filter from '@/components/shared/Filter'
import { UserFilters } from '@/constants/filters'
import { getAllUsers } from '@/lib/actions/user.action'
import Link from 'next/link'
import UserCard from '@/components/shared/card/UserCard'
import { SearchParamsProps } from '@/types'
import Pagination from '@/components/shared/Pagination'

const Page = async ({ searchParams }: SearchParamsProps) => {
  const result = await getAllUsers({
    searchQuery: searchParams.q,
    filter: searchParams.filter,
    page: searchParams.page ? +searchParams.page : 1,
    pageSize: 10,
  })

  return (
    <>
      <h1 className='h1-bold text-dark100_light900'>社区成员</h1>

      <div className='mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center'>
        <LocalSearchbar
          route='/community'
          iconPosition='left'
          imgSrc='/assets/icons/search.svg'
          placeholder='在社区中搜索'
          otherClasses='flex-1'
        />
        <Filter
          filters={UserFilters}
          otherClasses='min-h-[56px] sm:min-w-[170px]'
        />
      </div>

      <section className='mt-12 flex flex-wrap gap-4'>
        {result.users.length > 0 ? (
          result.users.map((user) => <UserCard key={user.name} user={user} />)
        ) : (
          <div className='paragraph-regular text-dark200_light800 mx-auto max-w-4xl text-center'>
            <p>暂无用户</p>
            <Link
              href={'/sign-up'}
              className=' mt-4 block font-bold text-accent-blue'
            >
              点击注册，加入我们
            </Link>
          </div>
        )}
      </section>

      <div className='mt-10'>
        <Pagination
          pageNumber={searchParams?.page ? +searchParams.page : 1}
          isNext={result.isNext}
        />
      </div>
    </>
  )
}

export default Page
