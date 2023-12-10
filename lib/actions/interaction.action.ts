'use server'

import Question from '@/database/question.model'
import Interaction from '@/database/interaction.model'
import { ViewQuestionParams } from './shared.types'

export async function viewQuestion(params: ViewQuestionParams) {
  try {
    const { questionId, userId } = params

    await Question.findByIdAndUpdate(questionId, {
      $inc: { views: 1 },
    })
    
    if (userId) {
      const existingInteraction = await Interaction.findOne({
        user: userId,
        question: questionId,
        action: 'view',
      })

      if (existingInteraction) return console.log('用户已经浏览过该问题')

      await Interaction.create({
        user: userId,
        question: questionId,
        action: 'view',
      })
    }
  } catch (error) {
    console.log(error)
    throw error
  }
}
