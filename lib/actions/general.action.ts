'use server'

import { SearchParams } from '@/lib/actions/shared.types'
import { connectToDatabase } from '@/lib/mogoose'
import Question from '@/database/question.model'
import User from '@/database/user.model'
import Answer from '@/database/answer.model'
import Tag from '@/database/tag.model'

const SearchableTypes = ['question', 'user', 'answer', 'tag']

export async function globalSearch(params: SearchParams) {
  try {
    await connectToDatabase()

    const { query, type } = params
    const regexQuery = { $regex: query, $options: 'i' }

    let results: { title: any; type: string | null | undefined; id: any }[] = []

    const modelsAndTypes = [
      {
        model: Question,
        searchField: 'title',
        label: '问题',
        type: 'question',
      },
      { model: User, searchField: 'name', label: '用户', type: 'user' },
      { model: Answer, searchField: 'content', label: '回答', type: 'answer' },
      { model: Tag, searchField: 'name', label: '标签', type: 'tag' },
    ]

    const typeLower = type?.toLowerCase()

    if (!typeLower || !SearchableTypes.includes(typeLower)) {
      // 搜索所有类型
      for (const modelInfo of modelsAndTypes) {
        const queryResults = await modelInfo.model
          .find({
            [modelInfo.searchField]: regexQuery,
          })
          .limit(2)

        results = results.concat(
          queryResults.map((item) => ({
            title:
              modelInfo.type === 'answer'
                ? `包含 ${query} 的回答`
                : item[modelInfo.searchField],
            type: modelInfo.type,
            label: modelInfo.label,
            id:
              modelInfo.type === 'user'
                ? item.clerkId
                : modelInfo.type === 'answer'
                  ? item.question
                  : item._id,
          }))
        )
      }

    } else {
      // 搜索指定类型
      const modelInfo = modelsAndTypes.find((item) => item.type === typeLower)
      console.log(modelInfo, type)
      if (!modelInfo) {
        throw new Error('无效的搜索类型')
      }

      const queryResults = await modelInfo.model
        .find({
          [modelInfo.searchField]: regexQuery,
        })
        .limit(8)

      results = queryResults.map((item) => ({
        title:
          type === 'answer'
            ? `包含 ${query} 的回答`
            : item[modelInfo.searchField],
        type,
        label: modelInfo.label,
        id:
          type === 'user'
            ? item.clerkId
            : type === 'answer'
              ? item.question
              : item._id,
      }))
    }
    return JSON.stringify(results)
  } catch (e) {
    console.log(e)
    throw e
  }
}
