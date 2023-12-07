/* eslint-disable camelcase */
import { Webhook } from 'svix' // 导入 'svix' 中的 Webhook
import { headers } from 'next/headers' // 从 'next/headers' 导入 headers
import { WebhookEvent } from '@clerk/nextjs/server'
import {
  createUser,
  deleteUser,
  getUserById,
  updateUser,
} from '@/lib/actions/user.action'
import { NextResponse } from 'next/server' // 从 '@clerk/nextjs/server' 导入 WebhookEvent

export async function POST(req: Request) {
  // 定义异步函数 POST
  // 从 Clerk 仪表板 - > Webhooks - > 选择 webhook 中找到这个
  const WEBHOOK_SECRET = process.env.NEXT_CLERK_WEBHOOK_SECRET
  if (!WEBHOOK_SECRET) {
    // 如果 WEBHOOK_SECRET不存在
    throw new Error( // 抛出错误
      '请将 Clerk 仪表板 中的 WEBHOOK_SECRET 添加到 .env 或 .env.local 中'
    )
  }
  // 获取 headers
  const headerPayload = headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')
  // 如果没有 headers，报错
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('错误发生 -- 缺少 svix headers', {
      status: 400,
    })
  }
  // 获取 body
  const payload = await req.json()
  const body = JSON.stringify(payload)
  // 使用你的 secret 创建一个新的 Svix 实例。
  const wh = new Webhook(WEBHOOK_SECRET)
  let evt: WebhookEvent
  // 使用 headers 验证载荷
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('验证 webhook 出错:', err) // 在控制台输出错误
    return new Response('错误发生', {
      status: 400,
    })
  }

  const eventType = evt.type
  console.log('事件类型:', eventType)
  if (eventType === 'user.created') {
    // 如果事件类型是 '创建用户'
    const { id, email_addresses, image_url, username, first_name, last_name } =
      evt.data
    const mongoUser = await createUser({
      clerkId: id,
      email: email_addresses[0]?.email_address,
      name: last_name + first_name,
      username: username || '',
      picture: image_url,
    })

    return NextResponse.json({ message: '创建用户成功', user: mongoUser })
  }
  if (eventType === 'user.updated') {
    // 如果事件类型是 '更新用户'
    const { id, email_addresses, image_url, username, first_name, last_name } =
      evt.data
    const mongoUser = await getUserById({ userId: id })
    if (!mongoUser) {
      return new Response('错误发生 -- 用户不存在', {
        status: 400,
      })
    }
    const updatedUser = await updateUser({
      clerkId: id,
      updateData: {
        email: email_addresses[0]?.email_address,
        name: last_name + first_name,
        username: username || '',
        picture: image_url,
      },
      path: `/profile/${id}`,
    })

    return NextResponse.json({ message: '更新用户成功', user: updatedUser })
  }

  if (eventType === 'user.deleted') {
    // 如果事件类型是 '删除用户'
    const { id } = evt.data
    const mongoUser = await deleteUser({ clerkId: id! })

    return NextResponse.json({ message: '删除用户成功', user: mongoUser })
  }

  return new Response('', { status: 200 }) // 返回状态 200
}
