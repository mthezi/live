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
  ToggleSaveQuestionParams,
  UpdateUserParams,
} from '@/lib/actions/shared.types'
import { revalidatePath } from 'next/cache'
import Question from '@/database/question.model'
import Tag from '@/database/tag.model'

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

    // const { page = 1, pageSize = 20, filter, searchQuery } = params

    const users = await User.find({}).sort({ createdAt: -1 })
    return { users }
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

    const query: FilterQuery<typeof Question> = searchQuery
      ? { title: { $regex: new RegExp(searchQuery, 'i') } }
      : {}

    const user = await User.findOne({ clerkId }).populate({
      path: 'saved',
      match: query,
      options: {
        sort: { createdAt: -1 },
        skip: (page - 1) * pageSize,
        limit: pageSize,
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

    return { questions: savedQuestions }
  } catch (error) {
    console.log(error)
    throw error
  }
}
