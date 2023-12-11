'use server'

import { connectToDatabase } from '@/lib/mogoose'
import Question from '@/database/question.model'
import Tag from '@/database/tag.model'
import {
  CreateQuestionParams,
  DeleteQuestionParams,
  EditQuestionParams,
  GetQuestionByIdParams,
  GetQuestionsParams,
  QuestionVoteParams,
  RecommendedParams,
} from '@/lib/actions/shared.types'
import User from '@/database/user.model'
import { revalidatePath } from 'next/cache'
import Answer from '@/database/answer.model'
import Interaction from '@/database/interaction.model'
import { FilterQuery } from 'mongoose'

export async function getQuestions(params: GetQuestionsParams) {
  try {
    await connectToDatabase()

    const { searchQuery, filter, page = 1, pageSize = 10 } = params
    const skip = (page - 1) * pageSize

    const query: FilterQuery<typeof Question> = {}

    if (searchQuery) {
      query.$or = [
        { title: { $regex: new RegExp(searchQuery, 'i') } },
        { content: { $regex: new RegExp(searchQuery, 'i') } },
      ]
    }

    let sortOptions = {}

    switch (filter) {
      case 'newest':
        sortOptions = { createdAt: -1 }
        break
      case 'frequent':
        sortOptions = { views: -1 }
        break
      case 'unanswered':
        query.answers = { $size: 0 }
        break
      default:
        break
    }

    const questions = await Question.find(query)
      .populate({ path: 'tags', model: Tag })
      .populate({ path: 'author', model: User })
      .skip(skip)
      .limit(pageSize)
      .sort(sortOptions)

    const total = await Question.countDocuments(query)
    const isNext = total > skip + questions.length

    return { questions, isNext }
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function createQuestion(params: CreateQuestionParams) {
  try {
    console.log('=> 创建问题')
    await connectToDatabase()
    const { title, content, tags, author, path } = params

    // 创建问题
    const question = await Question.create({
      title,
      content,
      author,
    })

    const tagDocs = []

    // 创建标签
    for (const tag of tags) {
      const tagDoc = await Tag.findOneAndUpdate(
        // 查询条件, 通过正则表达式匹配，忽略大小写
        { name: { $regex: new RegExp(`^${tag}$`, 'i') } },
        // 更新操作，如果不存在则创建，然后将问题添加到 tag 问题数组中
        {
          $setOnInsert: { name: tag },
          $push: { questions: question._id },
        },
        // 选项，如果不存在则创建，返回更新后的文档
        {
          upsert: true,
          new: true,
        }
      )
      tagDocs.push(tagDoc)
    }

    // 将问题添加到标签问题数组中
    await Question.findByIdAndUpdate(question._id, {
      $push: { tags: { $each: tagDocs } },
    })

    await Interaction.create({
      user: author,
      action: 'ask_question',
      question: question._id,
      tags: tagDocs,
    })

    await User.findByIdAndUpdate(author, { $inc: { reputation: 5 } })

    revalidatePath(path)
  } catch (error) {
    console.log(error)
  }
}

export async function getQuestionById(params: GetQuestionByIdParams) {
  try {
    await connectToDatabase()

    const { questionId } = params
    const question = await Question.findById(questionId)
      .populate({
        path: 'tags',
        model: Tag,
        select: '_id name',
      })
      .populate({
        path: 'author',
        model: User,
        select: '_id clerkId name picture',
      })

    return question
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function upvoteQuestion(parmas: QuestionVoteParams) {
  console.log('=> 点赞问题')

  try {
    await connectToDatabase()

    const { questionId, userId, hasupvoted, hasdownvoted, path } = parmas

    console.log(
      '=> 点赞问题',
      questionId,
      userId,
      hasupvoted,
      hasdownvoted,
      path
    )

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

    const question = await Question.findByIdAndUpdate(questionId, updateQuery, {
      new: true,
    })

    if (!question) {
      throw new Error('问题不存在')
    }

    // 更新投票用户声望
    await User.findByIdAndUpdate(userId, {
      $inc: { reputation: hasupvoted ? -1 : 1 },
    })

    // 更新问题作者声望
    await User.findByIdAndUpdate(question.author, {
      $inc: { reputation: hasupvoted ? -10 : 10 },
    })
    revalidatePath(path)
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function downvoteQuestion(parmas: QuestionVoteParams) {
  try {
    await connectToDatabase()

    const { questionId, userId, hasupvoted, hasdownvoted, path } = parmas

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

    const question = await Question.findByIdAndUpdate(questionId, updateQuery, {
      new: true,
    })

    if (!question) {
      throw new Error('问题不存在')
    }

    await User.findByIdAndUpdate(userId, {
      $inc: { reputation: hasdownvoted ? -2 : 2 },
    })

    await User.findByIdAndUpdate(question.author, {
      $inc: { reputation: hasdownvoted ? 10 : -10 },
    })

    revalidatePath(path)
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function deleteQuestion(params: DeleteQuestionParams) {
  try {
    await connectToDatabase()

    const { questionId, path } = params

    // 删除问题
    await Question.deleteOne({ _id: questionId })

    // 删除问题的回答
    await Answer.deleteMany({ question: questionId })

    // 删除问题的标签
    await Tag.updateMany(
      { questions: questionId },
      { $pull: { questions: questionId } }
    )

    // 删除问题的交互
    await Interaction.deleteMany({ question: questionId })

    revalidatePath(path)
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function editQuestion(params: EditQuestionParams) {
  try {
    await connectToDatabase()

    const { questionId, title, content, path } = params

    const question = await Question.findById(questionId).populate('tags')

    if (!question) {
      throw new Error('问题不存在')
    }

    question.title = title
    question.content = content

    await question.save()

    revalidatePath(path)
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function getHotQuestions() {
  try {
    await connectToDatabase()

    const hotQuestions = await Question.find({})
      .sort({ views: -1, upvotes: -1 })
      .limit(5)

    return hotQuestions
  } catch (e) {
    console.log(e)
    throw e
  }
}

export async function getRecommendedQuestions(params: RecommendedParams) {
  try {
    await connectToDatabase()

    const { userId, page = 1, pageSize = 20, searchQuery } = params

    const user = await User.findOne({ clerkId: userId })

    if (!user) {
      throw new Error('用户不存在')
    }

    const skip = (page - 1) * pageSize

    const userInteactions = await Interaction.find({ user: user._id })
      .populate('tags')
      .exec()

    const userTags = userInteactions.reduce((tags, interaction) => {
      if (interaction.tags) {
        tags.push(...interaction.tags)
      }
      return tags
    }, [])

    const distinctUserTags = Array.from(new Set(userTags.map((tag: any) => tag._id)))

    const query: FilterQuery<typeof Question> = {
      $and: [
        { tags: { $in: distinctUserTags } },
        { author: { $ne: user._id } },
      ]
    }

    if (searchQuery) {
      query.$or = [
        { title: { $regex: new RegExp(searchQuery, 'i') } },
        { content: { $regex: new RegExp(searchQuery, 'i') } },
      ]
    }

    const totalQuestions = await Question.countDocuments(query)

    const recommendedQuestion = await Question.find(query)
      .populate({
        path: 'tags',
        model: Tag,
      })
      .populate({
        path: 'author',
        model: User,
      })
      .skip(skip)
      .limit(pageSize)

    const isNext = totalQuestions > skip + recommendedQuestion.length

    return { questions: recommendedQuestion, isNext }
  } catch (e) {
    console.log(e)
    throw e
  }
}
