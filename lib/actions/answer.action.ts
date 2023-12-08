'use server'

import {
  CreateAnswerParams,
  GetAnswersParams,
} from '@/lib/actions/shared.types'
import { connectToDatabase } from '@/lib/mogoose'
import Answer from '@/database/answer.model'
import Question from '@/database/question.model'
import { revalidatePath } from 'next/cache'

export async function createAnswer(params: CreateAnswerParams) {
  try {
    await connectToDatabase()

    const { content, author, question, path } = params

    const newAnswer = await Answer.create({ content, author, question })

    // 将回答添加到问题的回答数组中
    await Question.findByIdAndUpdate(question, {
      $push: { answers: newAnswer._id },
    })

    // 更多

    revalidatePath(path)
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function getAnswers(params: GetAnswersParams) {
  try {
    await connectToDatabase()
    const { questionId } = params
    const answers = await Answer.find({ question: questionId })
      .populate('author', '_id clerkId name picture')
      .sort({ createdAt: -1 })

    return { answers }
  } catch (error) {
    console.log(error)
    throw error
  }
}
