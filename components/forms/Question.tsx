'use client'

import React, { useState } from 'react'
import '@uiw/react-md-editor/markdown-editor.css'
import '@uiw/react-markdown-preview/markdown.css'
import dynamic from 'next/dynamic'
import * as commands from '@uiw/react-md-editor/commands'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { QuestionSchema } from '@/lib/validations'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { createQuestion } from '@/lib/actions/question.action'
import { useRouter, usePathname } from 'next/navigation'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), {
  ssr: false,
})

const type: any = 'create'

interface QuestionProps {
  mongoUserId: string
}

const Question = ({ mongoUserId }: QuestionProps) => {
  const [value, setValue] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const router = useRouter()
  const pathname = usePathname()

  const form = useForm<z.infer<typeof QuestionSchema>>({
    resolver: zodResolver(QuestionSchema),
    defaultValues: {
      title: '',
      explanation: '',
      tags: [],
    },
  })

  async function onSubmit(values: z.infer<typeof QuestionSchema>) {
    setIsSubmitting(true)

    try {
      // 异步请求创建一个新问题
      await createQuestion({
        title: values.title,
        content: values.explanation,
        tags: values.tags,
        author: JSON.parse(mongoUserId),
        path: pathname,
      })
      // 成功后跳转到问题详情页
      router.push('/')
    } catch (error) {
    } finally {
      setIsSubmitting(false)
    }
    console.log(values)
  }

  function handleInputKeyDown(
    e: React.KeyboardEvent<HTMLInputElement>,
    field: any
  ) {
    if (e.key === 'Enter' && field.name === 'tags') {
      e.preventDefault()
      const tagInput = e.target as HTMLInputElement
      const tagValue = tagInput.value.trim()
      if (tagValue !== '') {
        if (tagValue.length > 15) {
          return form.setError('tags', {
            type: 'max',
            message: '标签长度不能超过 15 个字符',
          })
        }
        if (field.value.length >= 3) {
          return form.setError('tags', {
            type: 'max',
            message: '最多只能添加 3 个标签',
          })
        }
        if (!field.value.includes(tagValue)) {
          form.setValue('tags', [...field.value, tagValue])
          tagInput.value = ''
          form.clearErrors('tags')
        } else {
          form.trigger()
        }
      }
    }
  }

  function handleTagRemove(tag: string, field: any) {
    const newTags = field.value.filter((t: string) => t !== tag)
    form.setValue('tags', newTags)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='flex w-full flex-col gap-10'
      >
        <FormField
          control={form.control}
          name='title'
          render={({ field }) => (
            <FormItem className='flex w-full flex-col'>
              <FormLabel className='paragraph-semibold text-dark400_light900'>
                标题 <span className='text-primary-500'>*</span>
              </FormLabel>
              <FormControl className='mt-3.5'>
                <Input
                  className='no-focus paragraph-regular background-light900_dark300 light-border-2 text-dark300_light700 min-h-[56x] border'
                  {...field}
                />
              </FormControl>
              <FormDescription className='body-regular mt-2.5 text-light-500'>
                标题应该简明扼要地描述您的问题
              </FormDescription>
              <FormMessage className='text-red-500' />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='explanation'
          render={({ field }) => (
            <FormItem className='flex w-full flex-col gap-3'>
              <FormLabel className='paragraph-semibold text-dark400_light900'>
                详情 <span className='text-primary-500'>*</span>
              </FormLabel>
              <FormControl className='mt-3.5'>
                <MDEditor
                  value={value}
                  onBlur={field.onBlur}
                  onChange={(v) => {
                    // @ts-ignore
                    setValue(v)
                    field.onChange(v)
                  }}
                />
              </FormControl>
              <FormDescription className='body-regular mt-2.5 text-light-500'>
                详细描述你的问题，包括你已经做了什么尝试和你期望的结果是什么，不少于
                20 个字符
              </FormDescription>
              <FormMessage className='text-red-500' />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='tags'
          render={({ field }) => (
            <FormItem className='flex w-full flex-col'>
              <FormLabel className='paragraph-semibold text-dark400_light900'>
                标签 <span className='text-primary-500'>*</span>
              </FormLabel>
              <FormControl className='mt-3.5'>
                <>
                  <Input
                    className='no-focus paragraph-regular background-light900_dark300 light-border-2 text-dark300_light700 min-h-[56x] border'
                    placeholder='添加标签'
                    onKeyDown={(e) => handleInputKeyDown(e, field)}
                  />
                  {field.value.length > 0 && (
                    <div className='flex-start mt-2.5 gap-2.5'>
                      {field.value.map((tag: any) => (
                        <Badge
                          key={tag}
                          className='subtle-medium background-light800_dark300 text-light400_light500 flex items-center justify-center gap-2 rounded-md border-none px-4 py-2 capitalize'
                        >
                          {tag}
                          <Image
                            src='/assets/icons/close.svg'
                            alt='关闭图标'
                            width={12}
                            height={12}
                            className='cursor-pointer object-contain invert-0 dark:invert'
                            onClick={() => handleTagRemove(tag, field)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </>
              </FormControl>
              <FormDescription className='body-regular mt-2.5 text-light-500'>
                为你的问题添加标签，以便更容易被发现，最多 3 个
              </FormDescription>
              <FormMessage className='text-red-500' />
            </FormItem>
          )}
        />
        <Button
          type='submit'
          className='primary-gradient w-fit !text-light-900'
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>{type === 'edit' ? '修改中...' : '发布中...'}</>
          ) : (
            <>{type === 'edit' ? '修改' : '发布'}</>
          )}
        </Button>
      </form>
    </Form>
  )
}

export default Question
