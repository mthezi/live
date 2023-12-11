'use client'
import React from 'react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formUrlQuery } from '@/lib/utils'
import { useRouter, useSearchParams } from 'next/navigation'

interface FilterProps {
  filters: {
    name: string
    value: string
  }[]
  containerClasses?: string
  otherClasses?: string
}

const Filter = ({ filters, containerClasses, otherClasses }: FilterProps) => {
  const searchParams = useSearchParams()
  const router = useRouter()

  const paramFilter = searchParams.get('filter')

  const handleUpdateParams = (value: string) => {
    let newUrl: string
    if (value === searchParams.get('filter')) {
      newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: 'filter',
        value: null,
      })
    } else {
      newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: 'filter',
        value,
      })
    }
    router.push(newUrl, { shallow: true })
  }

  return (
    <div className={`relative ${containerClasses}`}>
      <Select
        onValueChange={(value) => handleUpdateParams(value)}
        defaultValue={paramFilter || undefined}
      >
        <SelectTrigger
          className={`${otherClasses} body-regular light-border background-light800_dark300 text-dark500_light700 border px-5 py-2.5`}
        >
          <div className='line-clamp-1 flex-1 text-left'>
            <SelectValue placeholder='筛选' />
          </div>
        </SelectTrigger>
        <SelectContent className='text-dark500_light700 small-regular border-none bg-light-900 dark:bg-dark-300'>
          <SelectGroup>
            {filters.map((filter) => (
              <SelectItem
                key={filter.value}
                className='body-regular text-dark500_light700 hover:bg-light-800 cursor-pointer focus:bg-light-800 dark:hover:bg-dark-400 dark:focus:bg-dark-400'
                value={filter.value}
              >
                {filter.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}

export default Filter
