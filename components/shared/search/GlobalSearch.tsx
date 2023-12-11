'use client'
import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { formUrlQuery, removeKeysFromQuery } from '@/lib/utils'
import GlobalResult from '@/components/shared/search/GlobalResult'

const GlobalSearch = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const searchContainerRef = useRef(null)

  const query = searchParams.get('global')
  const [search, setSearch] = useState(query || '')
  const [isOpen, setIsOpen] = useState(search !== '')

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (
        searchContainerRef.current &&
        // @ts-ignore
        !searchContainerRef.current.contains(event.target)
      ) {
        setIsOpen(false)
        setSearch('')
      }
    }
    setIsOpen(false)

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [pathname])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (search) {
        const newUrl = formUrlQuery({
          params: searchParams.toString(),
          key: 'global',
          value: search,
        })
        console.log('newUrl', newUrl)
        router.push(newUrl, { scroll: false })
      } else {
        if (query) {
          const newUrl = removeKeysFromQuery({
            params: searchParams.toString(),
            keysToRemove: ['global', 'type'],
          })
          router.push(newUrl, { scroll: false })
        }
      }
    }, 300)
    return () => clearTimeout(delayDebounceFn)
  }, [search, pathname, router, searchParams, query])
  return (
    <div
      className='relative w-full max-w-[600px] max-lg:hidden'
      ref={searchContainerRef}
    >
      <div className='background-light800_darkgradient relative flex min-h-[56px] grow items-center gap-1 rounded-xl px-4'>
        <Image
          src='/assets/icons/search.svg'
          alt='搜索'
          width={24}
          height={24}
          className='cursor-pointer'
        />

        <Input
          type='text'
          placeholder='全局搜索'
          value={search}
          onFocus={() => {
            if (!isOpen && search !== '') {
              setIsOpen(true)
            }
          }}
          onChange={(e) => {
            setSearch(e.target.value)

            if (!isOpen) {
              setIsOpen(true)
            }

            if (e.target.value === '' && isOpen) {
              setIsOpen(false)
            }
          }}
          className='paragraph-regular text-dark400_light700 no-focus placeholder bg-transparent  border-none shadow-none outline-none'
        />
      </div>
      {isOpen && <GlobalResult />}
    </div>
  )
}

export default GlobalSearch
