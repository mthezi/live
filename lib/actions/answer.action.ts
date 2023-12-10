'use server'

import {
  AnswerVoteParams,
  CreateAnswerParams,
  DeleteAnswerParams,
  GetAnswersParams,
} from '@/lib/actions/shared.types'
import { connectToDatabase } from '@/lib/mogoose'
import Answer from '@/database/answer.model'
import Question from '@/database/question.model'
import { revalidatePath } from 'next/cache'
import Interaction from '@/database/interaction.model'

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
    const { questionId, sortBy, page = 1, pageSize = 10 } = params

    const skip = (page - 1) * pageSize

    let sortOptions = {}

    switch (sortBy) {
      case 'highestUpvotes':
        sortOptions = { upvotes: -1 }
        break
      case 'lowestUpvotes':
        sortOptions = { upvotes: 1 }
        break
      case 'recent':
        sortOptions = { createdAt: -1 }
        break
      case 'old':
        sortOptions = { createdAt: 1 }
        break
      default:
        sortOptions = { createdAt: -1 }
    }


    const answers = await Answer.find({ question: questionId })
      .populate('author', '_id clerkId name picture')
      .sort(sortOptions)
      .skip(skip)
      .limit(pageSize)

    const total = await Answer.countDocuments({ question: questionId })
    const isNext = total > skip + answers.length

    return { answers, isNext }
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function upvoteAnswer(parmas: AnswerVoteParams) {
  console.log('=> 点赞回答')

  try {
    await connectToDatabase()

    const { answerId, userId, hasupvoted, hasdownvoted, path } = parmas

    console.log('=> 点赞回答', answerId, userId, hasupvoted, hasdownvoted, path)

    let updateQuery = {}

    if (hasupvoted) {
      updateQuery = { $pull: { upvotes: userId } }
    } else if (hasdownvoted) {
      updateQuery = {
        $pull: { downvotes: userId },
        $push: { upvotes: userId },
      }
    } else {
      updateQuery = { $addToSet: { upvotes: userId } }
    }

    const answer = await Answer.findByIdAndUpdate(answerId, updateQuery, {
      new: true,
    })

    console.log('=> 点赞问题', answer)

    if (!answer) {
      throw new Error('回答不存在')
    }

    revalidatePath(path)
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function downvoteAnswer(parmas: AnswerVoteParams) {
  try {
    await connectToDatabase()

    const { answerId, userId, hasupvoted, hasdownvoted, path } = parmas

    let updateQuery = {}

    if (hasdownvoted) {
      updateQuery = { $pull: { downvotes: userId } }
    } else if (hasupvoted) {
      updateQuery = {
        $pull: { upvotes: userId },
        $push: { downvotes: userId },
      }
    } else {
      updateQuery = { $addToSet: { downvotes: userId } }
    }

    const answer = await Answer.findByIdAndUpdate(answerId, updateQuery, {
      new: true,
    })

    if (!answer) {
      throw new Error('回答不存在')
    }

    revalidatePath(path)
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function deleteAnswer(params: DeleteAnswerParams) {
  try {
    await connectToDatabase()

    const { answerId, path } = params

    const answer = await Answer.findByIdAndDelete(answerId)

    if (!answer) {
      throw new Error('回答不存在')
    }

    await Question.updateMany(
      // @ts-ignore
      { _id: answer.question },
      {
        $pull: { answers: answerId },
      }
    )

    await Interaction.deleteMany({ answer: answerId })

    revalidatePath(path)
  } catch (error) {
    console.log(error)
    throw error
  }
}
