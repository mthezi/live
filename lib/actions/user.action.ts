'use server'

import { connectToDatabase } from '@/lib/mogoose'
import User from '@/database/user.model'
import {
  CreateUserParams,
  DeleteUserParams,
  UpdateUserParams,
} from '@/lib/actions/shared.types'
import { revalidatePath } from 'next/cache'
import Question from '@/database/question.model'

export async function getUserById(params: any) {
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
    console.log("==>user: ", user)
    if (!user) {
      throw new Error('用户不存在')
    }

    // 获取用户的所有问题
    const userQuestionIds = await Question.find({ user: user._id }).distinct(
      '_id',
    )

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
