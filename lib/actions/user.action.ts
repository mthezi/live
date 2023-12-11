'use server'
import { FilterQuery } from 'mongoose'
import { connectToDatabase } from '@/lib/mogoose'
import User from '@/database/user.model'
import {
  CreateUserParams,
  DeleteUserParams,
  GetAllUsersParams,
  GetSavedQuestionsParams,
  GetUserByIdParams,
  GetUserStatsParams,
  ToggleSaveQuestionParams,
  UpdateUserParams,
} from '@/lib/actions/shared.types'
import { revalidatePath } from 'next/cache'
import Question from '@/database/question.model'
import Tag from '@/database/tag.model'
import Answer from '@/database/answer.model'
import { BadgeCriteriaType } from '@/types'
import { assignBadges } from '@/lib/utils'
import Interaction from '@/database/interaction.model'
import { log } from 'console'

export async function getUserById(params: GetUserByIdParams) {
  try {
    await connectToDatabase()

    const { userId } = params

    const user = await User.findOne({ clerkId: userId })
    return user
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function createUser(params: CreateUserParams) {
  try {
    await connectToDatabase()

    return await User.create(params)
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function updateUser(params: UpdateUserParams) {
  try {
    await connectToDatabase()

    const { clerkId, updateData, path } = params

    await User.findOneAndUpdate({ clerkId }, updateData, {
      new: true,
    })

    revalidatePath(path)
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function deleteUser(params: DeleteUserParams) {
  try {
    await connectToDatabase()

    const { clerkId } = params

    const { value: user } = await User.findOneAndDelete({ clerkId })

    if (!user) {
      throw new Error('用户不存在')
    }

    // 获取用户的所有问题
    // const userQuestionIds = await Question.find({ user: user._id }).distinct(
    //   '_id',
    // )

    // 删除用户的所有问题
    await Question.deleteMany({ user: user._id })

    // TODO: 删除用户的所有回答, 评论, 点赞, 收藏

    const deletedUser = await User.findByIdAndDelete(user._id)
    return deletedUser
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function getAllUsers(params: GetAllUsersParams) {
  try {
    await connectToDatabase()

    const { searchQuery, filter, page = 1, pageSize = 10 } = params
    const skip = (page - 1) * pageSize

    const query: FilterQuery<typeof User> = {}

    if (searchQuery) {
      query.$or = [
        { name: { $regex: new RegExp(searchQuery, 'i') } },
        { username: { $regex: new RegExp(searchQuery, 'i') } },
      ]
    }

    let sortOptions = {}
    // { name: '新用户', value: 'new_users' },
    // { name: '老用户', value: 'old_users' },
    // { name: '最佳贡献者', value: 'top_contributors' },
    switch (filter) {
      case 'new_users':
        sortOptions = { joinedAt: -1 }
        break
      case 'old_users':
        sortOptions = { joinedAt: 1 }
        break
      case 'top_contributors':
        sortOptions = { reputation: -1 }
        break
      default:
        break
    }

    const users = await User.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(pageSize)

    for (const user of users) {
      const userTags = await Interaction.find({
        user: user._id,
        action: 'ask_question',
      }).populate({ path: 'tags', model: Tag, select: '_id name' })

      const tags = userTags
        .map((tag) => tag.tags)
        .flat()
        .reduce(
          (acc, cur) => {
            if (acc[cur]) {
              acc[cur]++
            } else {
              acc[cur] = 1
            }
            return acc
          },
          {} as { [key: string]: number }
        )

      // console.log('tags', tags)
      const formattedTags = Object.keys(tags).map((key) => {
        const match = key.match(/ObjectId\('([^']+)'\)/)
        const _id = match ? match[1] : null
        const namePart = key.match(/name: '([^']+)'/)
        const name = namePart ? namePart[1] : null
        return { _id, name, nums: tags[key] }
      })

      const userObj = user.toObject()

      // 将 formattedTags 添加到 userObj
      userObj.tagsWithNums = formattedTags
      users[users.indexOf(user)] = userObj
    }

    const total = await User.countDocuments(query)
    const isNext = total > skip + users.length
    return { users, isNext }
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function toggleSaveQuestion(params: ToggleSaveQuestionParams) {
  try {
    await connectToDatabase()

    const { userId, questionId, path } = params

    const user = await User.findById(userId)

    if (!user) {
      throw new Error('用户不存在')
    }

    const isQuestionSaved = user.saved.includes(questionId)

    if (isQuestionSaved) {
      await User.findByIdAndUpdate(
        userId,
        { $pull: { saved: questionId } },
        { new: true }
      )
    } else {
      await User.findByIdAndUpdate(
        userId,
        { $addToSet: { saved: questionId } },
        { new: true }
      )
    }
    revalidatePath(path)
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function getSavedQuestions(params: GetSavedQuestionsParams) {
  try {
    await connectToDatabase()

    const { clerkId, page = 1, pageSize = 10, filter, searchQuery } = params
    const skip = (page - 1) * pageSize
    const query: FilterQuery<typeof Question> = searchQuery
      ? {
          $or: [
            { title: { $regex: new RegExp(searchQuery, 'i') } },
            { content: { $regex: new RegExp(searchQuery, 'i') } },
          ],
        }
      : {}

    let sortOptions = {}

    switch (filter) {
      case 'most_recent':
        sortOptions = { createdAt: -1 }
        break
      case 'oldest':
        sortOptions = { createdAt: 1 }
        break
      case 'most_voted':
        sortOptions = { upvotes: -1 }
        break
      case 'most_viewed':
        sortOptions = { views: -1 }
        break
      case 'most_answered':
        sortOptions = { answers: -1 }
        break
      default:
        break
    }

    const user = await User.findOne({ clerkId }).populate({
      path: 'saved',
      match: query,
      options: {
        sort: sortOptions,
        skip,
        limit: pageSize + 1,
      },
      populate: [
        { path: 'tags', model: Tag, select: '_id name' },
        { path: 'author', model: User, select: '_id clerkId name picture' },
      ],
    })

    if (!user) {
      throw new Error('用户不存在')
    }

    const savedQuestions = await user.saved

    const isNext = savedQuestions.length > pageSize

    if (isNext) {
      savedQuestions.pop()
    }

    return { questions: savedQuestions, isNext }
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function getUserInfo(params: GetUserByIdParams) {
  try {
    await connectToDatabase()

    const { userId } = params

    const user = await User.findOne({ clerkId: userId })

    if (!user) {
      throw new Error('用户不存在')
    }

    // 查询Interactions中user为userId的所有action为'ask_question'的记录中的所有tags（数组），然后去重
    const userTags = await Interaction.find({
      user: user._id,
      action: 'ask_question',
    }).populate({ path: 'tags', model: Tag, select: '_id name' })

    console.log('userTags', userTags)

    // const tags = userTags
    //   .map((tag) => tag.tags)
    //   .flat()
    //   .filter((tag, index, array) => array.indexOf(tag) === index)

    // 去重前，需要先统计每个tag的数量，然后按照数量排序
    const tags = userTags
      .map((tag) => tag.tags)
      .flat()
      .reduce(
        (acc, cur) => {
          if (acc[cur]) {
            acc[cur]++
          } else {
            acc[cur] = 1
          }
          return acc
        },
        {} as { [key: string]: number }
      )

    // console.log('tags', tags)
    const formattedTags = Object.keys(tags).map((key) => {
      const match = key.match(/ObjectId\('([^']+)'\)/)
      const _id = match ? match[1] : null
      const namePart = key.match(/name: '([^']+)'/)
      const name = namePart ? namePart[1] : null
      return { _id, name, nums: tags[key] }
    })

    // console.log('Formatted tags', formattedTags)

    const totalQuestions = await Question.countDocuments({ author: user._id })
    const totalAnswers = await Answer.countDocuments({ author: user._id })

    const [questionUpvotes] = await Question.aggregate([
      { $match: { author: user._id } },
      {
        $project: {
          _id: 0,
          upvotes: { $size: '$upvotes' },
        },
      },
      { $group: { _id: null, totalUpvotes: { $sum: '$upvotes' } } },
    ])

    const [answerUpvotes] = await Answer.aggregate([
      { $match: { author: user._id } },
      {
        $project: {
          _id: 0,
          upvotes: { $size: '$upvotes' },
        },
      },
      { $group: { _id: null, totalUpvotes: { $sum: '$upvotes' } } },
    ])

    const [questionViews] = await Question.aggregate([
      { $match: { author: user._id } },
      { $group: { _id: null, totalViews: { $sum: '$views' } } },
    ])

    const criteria = [
      { type: 'QUESTION_COUNT' as BadgeCriteriaType, count: totalQuestions },
      { type: 'ANSWER_COUNT' as BadgeCriteriaType, count: totalAnswers },
      {
        type: 'QUESTION_UPVOTES' as BadgeCriteriaType,
        count: questionUpvotes?.totalUpvotes || 0,
      },
      {
        type: 'ANSWER_UPVOTES' as BadgeCriteriaType,
        count: answerUpvotes?.totalUpvotes || 0,
      },
      {
        type: 'TOTAL_VIEWS' as BadgeCriteriaType,
        count: questionViews?.totalViews || 0,
      },
    ]

    console.log('criteria', criteria)

    const badgeCounts = assignBadges({ criteria })

    return {
      user,
      totalQuestions,
      totalAnswers,
      tagsWithNums: formattedTags,
      badgeCounts,
      reputation: user.reputation,
    }
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function getUserQuestions(params: GetUserStatsParams) {
  try {
    await connectToDatabase()

    const { userId, page = 1, pageSize = 10 } = params
    const skip = (page - 1) * pageSize

    const totalQuestions = await Question.countDocuments({ author: userId })

    const userQuestions = await Question.find({ author: userId })
      .sort({ views: -1, upvotes: -1 })
      .skip(skip)
      .limit(pageSize)
      .populate([
        { path: 'tags', model: Tag, select: '_id name' },
        { path: 'author', model: User, select: '_id clerkId name picture' },
      ])

    const isNext = totalQuestions > userQuestions.length + skip

    return { totalQuestions, questions: userQuestions, isNext }
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function getUserAnswers(params: GetUserStatsParams) {
  try {
    await connectToDatabase()

    const { userId, page = 1, pageSize = 10 } = params
    const skip = (page - 1) * pageSize

    const totalAnswers = await Answer.countDocuments({ author: userId })

    const userAnswers = await Answer.find({ author: userId })
      .sort({ upvotes: -1 })
      .skip(skip)
      .limit(pageSize)
      .populate([
        { path: 'question', model: Question, select: '_id title' },
        { path: 'author', model: User, select: '_id clerkId name picture' },
      ])

    const isNext = totalAnswers > userAnswers.length + skip

    return { totalAnswers, answers: userAnswers, isNext }
  } catch (error) {
    console.log(error)
    throw error
  }
}
