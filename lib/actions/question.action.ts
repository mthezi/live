'use server'

import { connectToDatabase } from '@/lib/mogoose'
import Question from '@/database/question.model'
import Tag from '@/database/tag.model'
import {
  CreateQuestionParams,
  GetQuestionByIdParams,
  GetQuestionsParams,
  QuestionVoteParams,
} from '@/lib/actions/shared.types'
import User from '@/database/user.model'
import { revalidatePath } from 'next/cache'

export async function getQuestions(params: GetQuestionsParams) {
  try {
    await connectToDatabase()
    const questions = await Question.find({})
      .populate({ path: 'tags', model: Tag })
      .populate({ path: 'author', model: User })
      .sort({ createdAt: -1 })
    return { questions }
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

    revalidatePath(path)
  } catch (error) {}
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
  console.log('=> 点赞问题');
  
  try {
    await connectToDatabase()

    const { questionId, userId, hasupvoted, hasdownvoted, path } = parmas

    console.log('=> 点赞问题', questionId, userId, hasupvoted, hasdownvoted, path);
    

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

    console.log('=> 点赞问题', question);
    

    if (!question) {
      throw new Error('问题不存在')
    }

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

    revalidatePath(path)
  } catch (error) {
    console.log(error)
    throw error
  }
}
