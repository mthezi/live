import type { Metadata } from 'next'
import './globals.css'
import React from 'react'
import { ClerkProvider } from '@clerk/nextjs'
import { zhCN } from '@clerk/localizations'
import { ThemeProvider } from '@/context/ThemeProvider'

export const metadata: Metadata = {
  title: '码上人生',
  description: '一个高质量程序员论坛',
  icons: ['/assets/images/site-logo.svg'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='zh-CN' className='custom-scrollbar'>
      <ClerkProvider
        localization={zhCN}
        appearance={{
          elements: {
            formButtonPrimary: 'primary-gradient',
            footerActionLink: 'primary-text-gradient hover:text-primary-500',
          },
        }}
      >
        <ThemeProvider>
          <body>{children}</body>
        </ThemeProvider>
      </ClerkProvider>
    </html>
  )
}
