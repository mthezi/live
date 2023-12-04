import { SidebarLink } from '@/types'

export const themes = [
  { value: 'light', label: '白天', icon: '/assets/icons/sun.svg' },
  { value: 'dark', label: '黑夜', icon: '/assets/icons/moon.svg' },
  { value: 'system', label: '自动', icon: '/assets/icons/computer.svg' },
]

export const sidebarLinks: SidebarLink[] = [
  {
    imgURL: '/assets/icons/home.svg',
    route: '/',
    label: '首页',
  },
  {
    imgURL: '/assets/icons/users.svg',
    route: '/community',
    label: '社区',
  },
  {
    imgURL: '/assets/icons/star.svg',
    route: '/collection',
    label: '收藏',
  },
  {
    imgURL: '/assets/icons/suitcase.svg',
    route: '/jobs',
    label: '工作',
  },
  {
    imgURL: '/assets/icons/tag.svg',
    route: '/tags',
    label: '标签',
  },
  {
    imgURL: '/assets/icons/user.svg',
    route: '/profile',
    label: '我的',
  },
  {
    imgURL: '/assets/icons/question.svg',
    route: '/ask-question',
    label: '提问',
  },
]
export const BADGE_CRITERIA = {
  QUESTION_COUNT: {
    BRONZE: 10,
    SILVER: 50,
    GOLD: 100,
  },
  ANSWER_COUNT: {
    BRONZE: 10,
    SILVER: 50,
    GOLD: 100,
  },
  QUESTION_UPVOTES: {
    BRONZE: 10,
    SILVER: 50,
    GOLD: 100,
  },
  ANSWER_UPVOTES: {
    BRONZE: 10,
    SILVER: 50,
    GOLD: 100,
  },
  TOTAL_VIEWS: {
    BRONZE: 1000,
    SILVER: 10000,
    GOLD: 100000,
  },
}
