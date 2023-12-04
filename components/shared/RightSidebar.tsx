import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import RenderTag from '@/components/shared/RenderTag'

const hotQuestions = [
  { _id: 1, title: '如何在React中使用useEffect' },
  { _id: 2, title: '如何在React中使用useEffect' },
  { _id: 3, title: '如何在React中使用useEffect' },
  { _id: 4, title: '如何在React中使用useEffect' },
  { _id: 5, title: '如何在React中使用useEffect' },
]

const popularTags = [
  { _id: 1, name: 'react', totalQuestions: 100 },
  { _id: 2, name: 'vue', totalQuestions: 100 },
  { _id: 3, name: 'javascript', totalQuestions: 100 },
  { _id: 4, name: 'typescript', totalQuestions: 100 },
  { _id: 5, name: 'nextjs', totalQuestions: 100 },
]

const RightSidebar = () => {
  return (
    <section className='background-light900_dark200 light-border custom-scrollbar sticky right-0 top-0 flex h-screen w-[350px] flex-col overflow-y-auto border-l p-6 pt-36 shadow-light-300 dark:shadow-none max-xl:hidden'>
      <div>
        <h3 className='h3-bold text-dark200_light900'>热门问题</h3>
        <div className='mt-7 flex w-full flex-col gap-[30px]'>
          {hotQuestions.map((question) => (
            <Link
              href={`/questions/${question._id}`}
              key={question._id}
              className='flex cursor-pointer items-center justify-between gap-7'
            >
              <h4 className='body-medium text-dark500_light700'>
                {question.title}
              </h4>
              <Image
                src='/assets/icons/chevron-right.svg'
                alt='查看问题'
                width={20}
                height={20}
                className='invert-colors'
              />
            </Link>
          ))}
        </div>
      </div>
      <div className='mt-16'>
        <h3 className='h3-bold text-dark200_light900'>热门标签</h3>
        <div className='mt-7 flex flex-col gap-4'>
          {popularTags.map((tag) => (
            <RenderTag
              key={tag._id}
              _id={tag._id}
              name={tag.name}
              totalQuestions={tag.totalQuestions}
              showCount
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default RightSidebar
