'use server'

import {
  GetAllTagsParams,
  GetTopInteractedTagsParams,
} from '@/lib/actions/shared.types'
import { connectToDatabase } from '@/lib/mogoose'
import User from '@/database/user.model'
import Tag from '@/database/tag.model'

export async function getTopInteractedTags(params: GetTopInteractedTagsParams) {
  try {
    await connectToDatabase()

    const { userId, limit = 3 } = params

    const user = await User.findById(userId)

    if (!user) {
      throw new Error('用户不存在')
    }

    // const topTags = user.topTags.slice(0, limit)
    // 等待创建Interaction集合

    return [
      { _id: '1', name: 'test' },
      { _id: '2', name: 'test2' },
    ]
  } catch (error) {
    console.log(error)
    throw error
  }
}


export async function getAllTags(params: GetAllTagsParams) {
  try {
    await connectToDatabase()


    const tags = await Tag.find({})
    return {tags}
  } catch (error) {
    console.log(error)
    throw error
  }
}
