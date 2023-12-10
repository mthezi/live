import * as z from 'zod'

export const QuestionSchema = z.object({
  title: z.string().min(5, '标题至少5个字符').max(130, '标题最多130个字符'),
  explanation: z.string().min(100, '内容至少 100 个字符'),
  tags: z
    .array(z.string().min(1, '标签至少1个字符').max(15, '标签最多15个字符'))
    .min(1, '至少要有1个标签')
    .max(3, '最多只能有3个标签'),
})

export const AnswerSchema = z.object({
  answer: z.string().min(100, '内容至少 100 个字符'),
})

export const ProfileSchema = z.object({
  name: z.string().min(2, '名字至少2个字符').max(50, '名字最多50个字符'),
  username: z
    .string()
    .min(2, '用户名至少2个字符')
    .max(50, '用户名最多50个字符'),
  portfolioWebsite: z.string().url('网址格式不正确').optional(),
  location: z
    .string()
    .min(2, '地址至少2个字符')
    .max(50, '地址最多50个字符')
    .optional(),
  bio: z
    .string()
    .min(2, '简介至少2个字符')
    .max(50, '简介最多50个字符')
    .optional(),
  // name: z.string().min(2).max(50),
  // username: z.string().min(2).max(50),
  // portfolioWebsite: z.string().url().optional(),
  // location: z.string().optional(),
  // bio: z.string().optional(),
})
