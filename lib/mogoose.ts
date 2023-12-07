import * as mongoose from 'mongoose'

let isConnected: boolean = false

export const connectToDatabase = async () => {
  mongoose.set('strictQuery', true)

  if (!process.env.MONGODB_URL) {
    throw new Error('process.env 未定义 MONGODB_URL')
  }

  if (isConnected) {
    console.log('=> 使用现有数据库连接')
    return Promise.resolve()
  }

  try {
    console.log('=> 新建数据库连接')
    await mongoose.connect(process.env.MONGODB_URL, {
      dbName: process.env.MONGODB_DB,
    })

    isConnected = true

    console.log('=> 数据库连接成功')
  } catch (error) {
    console.log('=> 数据库连接失败')
    console.log(error)
  }
}
