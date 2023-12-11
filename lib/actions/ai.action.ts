'use server'
import fetch from 'node-fetch'

const API_KEY = 'app-ffWVCgvvVqaJqSpeJkjE4oL2' // 请替换为你的 API-Key
const DIFY_API_URL = 'https://api.dify.ai/v1/completion-messages'

interface GenerateAIAnswerParams {
  question: string
  userId: string | null
}

export async function getAIAnswer({
  question,
  userId,
}: GenerateAIAnswerParams) {
  try {
    const response = await fetch(DIFY_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: {
          question,
        },
        response_mode: 'blocking',
        user: userId || 'anonymous',
      }),
    })

    if (!response.ok) {
      throw new Error(`网络异常，状态码：${response.status}`)
    }

    const data = await response.json()
    return data.answer.includes('\\n') || data.answer.includes('\\"')
      ? JSON.parse(data.answer)
      : data.answer
  } catch (error) {
    console.error(error)
  }
}
