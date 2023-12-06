import * as z from 'zod'

export const QuestionSchema = z.object({
  title: z.string().min(5, '标题至少5个字符').max(130, '标题最多130个字符'),
  explanation: z.string().max(1000, '内容最多1000个字符'),
  tags: z
    .array(z.string().min(1, '标签至少1个字符').max(15, '标签最多15个字符'))
    .min(1, '至少要有1个标签')
    .max(3, '最多只能有3个标签'),
})
