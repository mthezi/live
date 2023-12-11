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
import User from '@/database/user.model'

export async function createAnswer(params: CreateAnswerParams) {
  try {
    await connectToDatabase()

    const { content, author, question, path } = params

    const newAnswer = await Answer.create({ content, author, question })

    // 将回答添加到问题的回答数组中
    const newQuestion = await Question.findByIdAndUpdate(question, {
      $push: { answers: newAnswer._id },
    })

    await Interaction.create({
      user: author,
      action: 'answer',
      question,
      answer: newAnswer._id,
      tags: newQuestion.tags,
    })

    await User.findByIdAndUpdate(author, { $inc: { reputation: 10 } })

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
  try {
    await connectToDatabase()

    const { answerId, userId, hasupvoted, hasdownvoted, path } = parmas

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

    if (!answer) {
      throw new Error('回答不存在')
    }

    await User.findByIdAndUpdate(userId, {
      $inc: { reputation: hasupvoted ? -2 : 2 },
    })

    await User.findByIdAndUpdate(answer.author, {
      $inc: { reputation: hasupvoted ? -10 : 10 },
    })

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


    // 点踩的人：1、取消点踩，声望减少2。2、点踩，声望增加2。
    await User.findByIdAndUpdate(userId, {
      $inc: { reputation: hasdownvoted ? -2 : 2 },
    })

    // 被点踩的人（作者）：1、取消点踩，声望加10。2、点踩，声望减少10。
    await User.findByIdAndUpdate(answer.author, {
      $inc: { reputation: hasdownvoted ? 10 : -10 },
    })

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
