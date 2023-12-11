import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import qs from 'query-string'
import { BADGE_CRITERIA } from '@/constants'
import { BadgeCounts } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getTimeStamp = (createdAt: Date): string => {
  const now = new Date()
  const seconds = Math.floor((now.getTime() - createdAt.getTime()) / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  if (years > 0) {
    return `${years} 年前`
  } else if (months > 0) {
    return `${months} 个月前`
  } else if (weeks > 0) {
    return `${weeks} 周前`
  } else if (days > 0) {
    return `${days} 天前`
  } else if (hours > 0) {
    return `${hours} 小时前`
  } else if (minutes > 0) {
    return `${minutes} 分钟前`
  } else {
    return `刚刚`
  }
}

export function formatLargeNumber(number: number): string {
  // 健壮性判断
  if (number === null || number === undefined) {
    return '0'
  }

  if (number < 10000) {
    return number.toString()
  } else if (number < 100000000) {
    return (number / 10000).toFixed(1) + '万'
  } else {
    return (number / 100000000).toFixed(1) + '亿'
  }
}

export function formatDateToChinese(date: Date): string {
  const year = date.getFullYear()
  const month = date.getMonth() + 1 // 月份是从 0 开始的

  // 使用模板字符串来格式化日期，确保月份是两位数字
  return `${year}年${month.toString().padStart(2, '0')}月`
}

interface UrlQueryParams {
  params: string
  key: string
  value: string | null
}

export const formUrlQuery = ({ params, key, value }: UrlQueryParams) => {
  const currentUrl = qs.parse(params)

  currentUrl[key] = value
  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query: currentUrl,
    },
    { skipNull: true }
  )
}

interface RemoveUrlQueryParams {
  params: string
  keysToRemove: string[]
}

export const removeKeysFromQuery = ({
  params,
  keysToRemove,
}: RemoveUrlQueryParams) => {
  const currentUrl = qs.parse(params)

  keysToRemove.forEach((key) => {
    delete currentUrl[key]
  })
  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query: currentUrl,
    },
    { skipNull: true }
  )
}

interface BadgeParam {
  criteria: {
    type: keyof typeof BADGE_CRITERIA
    count: number
  }[]
}

export const assignBadges = (params: BadgeParam) => {
  const badgeCounts: BadgeCounts = {
    GOLD: 0,
    SILVER: 0,
    BRONZE: 0,
  }

  const { criteria } = params

  criteria.forEach((item) => {
    const { type, count } = item
    const badgeLevels: any = BADGE_CRITERIA[type]

    Object.keys(badgeLevels).forEach((level: any) => {
      if (count >= badgeLevels[level]) {
        badgeCounts[level as keyof BadgeCounts] += 1
      }
    })
  })
  return badgeCounts
}
