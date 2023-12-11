import React from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

interface RenderTagProps {
  _id: string
  name: string
  href?: string
  countVariant?: 'absolute' | 'default'
  totalQuestions?: number
  showCount?: boolean
}

const RenderTag = ({
  _id,
  href = `/tags/${_id}`,
  name,
  countVariant = 'default',
  totalQuestions,
  showCount,
}: RenderTagProps) => {
  return (
    <Link href={href} className='relative flex justify-between gap-2'>
      <Badge className='subtle-medium  background-light800_dark300 text-light400_light500 inline-flex items-center rounded-md border border-none border-transparent bg-slate-900 px-4 py-2 text-xs font-semibold uppercase shadow transition-colors hover:bg-slate-900/80 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:border-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/80 dark:focus:ring-slate-300'>
        {name}
      </Badge>
      {showCount && (
        <p
          className={` text-dark500_light700 ${
            countVariant === 'absolute'
              ? 'subtle-regular absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full  background-light800_dark300 '
              : 'small-medium'
          }`}
        >
          {totalQuestions}
        </p>
      )}
    </Link>
  )
}

export default RenderTag
