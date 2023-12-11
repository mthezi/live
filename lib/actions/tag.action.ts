'use server'

import {
  GetAllTagsParams,
  GetQuestionsByTagIdParams,
  GetTopInteractedTagsParams,
} from '@/lib/actions/shared.types'
import { connectToDatabase } from '@/lib/mogoose'
import User from '@/database/user.model'
import Tag, { ITag } from '@/database/tag.model'
import { FilterQuery } from 'mongoose'
import Question from '@/database/question.model'
import Interaction from '@/database/interaction.model'

export async function getTopInteractedTags(params: GetTopInteractedTagsParams) {
  try {
    await connectToDatabase()

    const { userId, limit = 3 } = params

    const user = await User.findById(userId)

    if (!user) {
      throw new Error('用户不存在')
    }

    const userTags = await Interaction.find({
      user: user._id,
      action: 'ask_question',
    }).populate({
      path: 'tags',
      model: Tag,
      select: '_id name',
    })

    // Simplify tag counting
    const tagCounts: any = userTags
      .flatMap((interaction) => interaction.tags)
      .reduce((acc, tag) => {
        const tagKey = tag._id.toString()
        acc[tagKey] = acc[tagKey] || { count: 0, _id: tag._id, name: tag.name }
        acc[tagKey].count++
        return acc
      }, {})

    // Convert to array and apply limit
    const formattedTags = Object.values(tagCounts)
      .sort((a: any, b: any) => b.count - a.count) // Sort by count in descending order
      .slice(0, limit) // Apply the limit
      .map((tag: any) => ({ _id: tag._id, name: tag.name, nums: tag.count }))

    return { tagsWithNums: formattedTags }
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function getAllTags(params: GetAllTagsParams) {
  try {
    await connectToDatabase()

    const { searchQuery, filter, page = 1, pageSize = 10 } = params
    const skip = (page - 1) * pageSize
    let matchQuery = {}

    if (searchQuery) {
      matchQuery = {
        $or: [
          { name: { $regex: new RegExp(searchQuery, 'i') } },
          { description: { $regex: new RegExp(searchQuery, 'i') } },
        ],
      }
    }

    let sortOptions = {}
    switch (filter) {
      case 'popular':
        sortOptions = { questionsCount: -1 }
        break
      case 'recent':
        sortOptions = { createdOn: -1 }
        break
      case 'name':
        sortOptions = { name: 1 }
        break
      case 'old':
        sortOptions = { createdOn: 1 }
        break
      default:
        sortOptions = { createdOn: -1 }
        break
    }

    const aggregationPipeline = [
      { $match: matchQuery },
      { $addFields: { questionsCount: { $size: '$questions' } } },
      { $sort: sortOptions },
      { $skip: skip },
      { $limit: pageSize },
    ]

    const tags = await Tag.aggregate(aggregationPipeline)

    const total = await Tag.countDocuments(matchQuery)
    const isNext = total > skip + tags.length

    return { tags, isNext }
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function getQuestionsByTagId(params: GetQuestionsByTagIdParams) {
  try {
    await connectToDatabase()

    const { tagId, page = 1, pageSize = 10, searchQuery, clerkId } = params
    const skip = (page - 1) * pageSize

     // 初始化 matchCondition 为一个空数组
     const matchCondition = [];

     // 如果 searchQuery 存在，则添加到 matchCondition
     if (searchQuery) {
       matchCondition.push({
         $or: [
           { title: { $regex: new RegExp(searchQuery, 'i') } },
           { content: { $regex: new RegExp(searchQuery, 'i') } },
         ],
       });
     }

     // 如果 userId 存在且不为空，则添加到 matchCondition
     if (clerkId) {
       const user = await User.findOne({ clerkId });
       if (!user) {
         throw new Error('用户不存在');
       }
       matchCondition.push({ author: user._id });
     }

    const tagFilter: FilterQuery<ITag> = { _id: tagId }
    const tag = await Tag.findOne(tagFilter).populate({
      path: 'questions',
      model: Question,
      match: matchCondition.length > 0 ? { $and: matchCondition } : {},
      options: {
        sort: { createdAt: -1 },
        skip,
        limit: pageSize + 1,
      },
      populate: [
        { path: 'tags', model: Tag, select: '_id name' },
        { path: 'author', model: User, select: '_id clerkId name picture' },
      ],
    })

    if (!tag) {
      throw new Error('标签不存在')
    }

    const questions = await tag.questions

    const isNext = questions.length > pageSize

    if (isNext) {
      questions.pop()
    }

    return { tagTitle: tag.name, questions, isNext }
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function getTopPopularTags() {
  try {
    await connectToDatabase()

    const popularTags = await Tag.aggregate([
      { $project: { name: 1, numberOfQuestions: { $size: '$questions' } } },
      { $sort: { numberOfQuestions: -1 } },
      { $limit: 5 },
    ])

    return popularTags
  } catch (e) {
    console.log(e)
    throw e
  }
}
