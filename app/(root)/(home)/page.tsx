import Link from 'next/link'
import { Button } from '@/components/ui/button'
import LocalSearchbar from '@/components/shared/search/LocalSearchbar'
import Filter from '@/components/shared/Filter'
import { HomePageFilters } from '@/constants/filters'
import HomeFilter from '@/components/home/HomeFilter'
import NoResult from '@/components/shared/NoResult'
import QuestionCard from '@/components/shared/card/QuestionCard'

const questions = [
  {
    _id: 'q1',
    title: '如何学习JavaScript?',
    description: '探讨有效学习JavaScript的方法和资源。',
    tags: [
      { _id: 't1', name: '编程' },
      { _id: 't2', name: 'JavaScript' },
    ],
    author: {
      _id: 'u1',
      name: '张三',
      picture: 'zhangsan_picture_url',
    },
    upvotes: 12000000,
    views: 3000000000,
    answers: [
      { _id: 'a1', content: '首先，可以从基础开始学习...', author: '李四' },
      { _id: 'a2', content: '我推荐阅读相关的在线教程...', author: '王五' },
    ],
    createdAt: new Date('2023-12-01'),
  },
  {
    _id: 'q2',
    title: '最好的前端框架是什么?',
    description: '讨论当前流行的前端框架，以及各自的优缺点。',
    tags: [
      { _id: 't3', name: '前端' },
      { _id: 't4', name: '框架' },
    ],
    author: {
      _id: 'u2',
      name: '赵六',
      picture: 'zhaoliu_picture_url',
    },
    upvotes: 85,
    views: 220,
    answers: [
      { _id: 'a3', content: '我个人更喜欢React...', author: '孙七' },
      { _id: 'a4', content: 'Vue具有轻量级和易上手的优势...', author: '周八' },
    ],
    createdAt: new Date('2023-11-25'),
  },
]

export default function Home() {
  return (
    <>
      <div className='flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center'>
        <h1 className='h1-bold text-dark100_light900'>所有问题</h1>
        <Link href={'/ask-question'} className='flex justify-end max-sm:w-full'>
          <Button className='primary-gradient min-h-[46px] px-4 py-3 !text-light-900'>
            提问
          </Button>
        </Link>
      </div>
      <div className='mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center'>
        <LocalSearchbar
          route='/'
          iconPosition='left'
          imgSrc='/assets/icons/search.svg'
          placeholder='搜索问题'
          otherClasses='flex-1'
        />
        <Filter
          filters={HomePageFilters}
          otherClasses='min-h-[56px] sm:min-w-[170px]'
          containerClasses='hidden max-md:flex'
        />
      </div>
      <HomeFilter />

      <div className='mt-10 flex w-full flex-col gap-6'>
        {questions.length > 0 ? (
          questions.map((question) => (
            <QuestionCard
              key={question._id}
              _id={question._id}
              title={question.title}
              description={question.description}
              tags={question.tags}
              author={question.author}
              upvotes={question.upvotes}
              views={question.views}
              answers={question.answers}
              createdAt={question.createdAt}
            />
          ))
        ) : (
          <NoResult
            title='没有找到相关问题'
            description='你可以尝试搜索其他问题，或者尝试进行提问'
            link='/ask-question'
            linkTitle='尝试进行提问'
          />
        )}
      </div>
    </>
  )
}
