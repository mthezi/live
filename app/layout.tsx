import type { Metadata } from 'next'
import './globals.css'
import React from 'react'
import { ClerkProvider } from '@clerk/nextjs'
import { zhCN } from '@clerk/localizations'

export const metadata: Metadata = {
  title: '码上人生',
  description: '一个高质量程序员论坛',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider localization={zhCN}>
      <html lang='zh-CN'>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
