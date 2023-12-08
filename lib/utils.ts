import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

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
