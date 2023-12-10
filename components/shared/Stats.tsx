import { formatLargeNumber } from '@/lib/utils'
import Image from 'next/image'
import React from 'react'

interface StatsCardProps {
  imgUrl: string
  value: number
  title: string
}

const StatsCard = ({ imgUrl, value, title }: StatsCardProps) => {
  return (
    <div className='light-border background-light900_dark300 flex flex-wrap items-center justify-start gap-4 rounded-md border p-6 shadow-light-300 dark:shadow-dark-200'>
      <Image src={imgUrl} alt={title} width={40} height={50} />

      <div>
        <p className='body-medium text-dark400_light700'>{title}</p>
        <p className='paragraph=semibold text-dark200_light900'>
          {formatLargeNumber(value)}{' '}
        </p>
      </div>
    </div>
  )
}
interface StatsProps {
  totalQuestions: number
  totalAnswers: number
}

const Stats = ({ totalQuestions, totalAnswers }: StatsProps) => {
  return (
    <div className='mt-10'>
      <h4 className='h3-semibold text-dark200_light900'>个人数据</h4>

      <div className='mt-5 grid grid-cols-1 gap-5 xs:grid-cols-2 md:grid-cols-4'>
        <div className='light-border background-light900_dark300 flex flex-wrap items-center justify-evenly gap-4 rounded-md border p-6 shadow-light-300 dark:shadow-dark-200'>
          <div>
            <p className='body-medium text-dark400_light700'>总问题数</p>
            <p className='paragraph=semibold text-dark200_light900'>
              {formatLargeNumber(totalQuestions)}{' '}
            </p>
          </div>
          <div>
            <p className='body-medium text-dark400_light700'>总回答数</p>
            <p className='paragraph=semibold text-dark200_light900'>
              {formatLargeNumber(totalAnswers)}{' '}
            </p>
          </div>
        </div>
        <StatsCard
          imgUrl='/assets/icons/gold-medal.svg'
          value={0}
          title='金牌'
        />
        <StatsCard
          imgUrl='/assets/icons/silver-medal.svg'
          value={0}
          title='银牌'
        />
        <StatsCard
          imgUrl='/assets/icons/bronze-medal.svg'
          value={0}
          title='铜牌'
        />
      </div>
    </div>
  )
}

export default Stats
