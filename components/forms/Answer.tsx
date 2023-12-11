'use client'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { AnswerSchema } from '@/lib/validations'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { createAnswer } from '@/lib/actions/answer.action'
import { usePathname } from 'next/navigation'
import { getAIAnswer } from '@/lib/actions/ai.action'
import toast from 'react-hot-toast'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), {
  ssr: false,
})

interface AnswerProps {
  authorId: string
  question: string
  questionId: string
}

const Answer = ({ authorId, question, questionId }: AnswerProps) => {
  const pathname = usePathname()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmittingAI, setIsSubmittingAI] = useState(false)
  const [value, setValue] = useState('')
  const form = useForm<z.infer<typeof AnswerSchema>>({
    resolver: zodResolver(AnswerSchema),
    defaultValues: {
      answer: '',
    },
  })

  const handleCreateAnswer = async (value: z.infer<typeof AnswerSchema>) => {
    setIsSubmitting(true)
    const tid = toast.loading('提交中...')

    try {
      await createAnswer({
        content: value.answer,
        author: JSON.parse(authorId),
        question: JSON.parse(questionId),
        path: pathname,
      })
      form.reset()

      setValue('')
    } catch (error) {
      toast.error('提交失败')
    } finally {
      toast.dismiss(tid)
      setIsSubmitting(false)
    }
  }

  async function generateAIAnswer() {
    if (!authorId) return

    setIsSubmittingAI(true)
    const tid = toast.loading('AI 生成中...')

    try {
      const answer = await getAIAnswer({
        question,
        userId: authorId,
      })
      if (answer) {
        setValue(answer)
        form.setValue('answer', answer)
      }
    } catch (e) {
      toast.error('AI 生成失败')
    } finally {
      setIsSubmittingAI(false)
      toast.dismiss(tid)
    }
  }

  return (
    <div className='mt-4'>
      <div className='flex flex-col justify-between gap-5 sm:flex-row sm:items-center sm:gap-2'>
        <h4 className='paragraph-semibold text-dark400_light800'>回答</h4>
        <Button
          className='btn light-border-2 gap-1.5 rounded-md px-4 py-2.5 text-primary-500 shadow-none dark:text-primary-500'
          onClick={generateAIAnswer}
          disabled={isSubmittingAI}
        >
          <Image
            src='/assets/icons/stars.svg'
            alt='星星'
            width={12}
            height={12}
            className='object-contain'
          />
          {isSubmittingAI ? 'AI生成中...' : '由 AI 生成答案'}
        </Button>
      </div>
      <Form {...form}>
        <form
          className='mt-6 flex w-full flex-col gap-10'
          onSubmit={form.handleSubmit(handleCreateAnswer)}
        >
          <FormField
            control={form.control}
            name='answer'
            render={({ field }) => (
              <FormItem className='flex w-full flex-col gap-3'>
                <FormControl className='mt-3.5'>
                  <MDEditor
                    value={value}
                    onBlur={field.onBlur}
                    minHeight={350}
                    height={350}
                    onChange={(v) => {
                      // @ts-ignore
                      setValue(v)
                      field.onChange(v)
                    }}
                  />
                </FormControl>
                <FormMessage className='text-red-500' />
              </FormItem>
            )}
          />

          <div className='flex justify-end'>
            <Button
              type='submit'
              className='primary-gradient w-fit text-white'
              disabled={isSubmitting}
            >
              {isSubmitting ? '提交中...' : '提交回答'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default Answer
