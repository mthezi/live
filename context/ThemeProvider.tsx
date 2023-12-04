'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface ThemeContextProps {
  mode: string
  setTheme: (mode: string) => void
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState('')

  // 此处的 getInitialTheme 函数用于获取用户的系统主题设置
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('theme')

    if (savedTheme) {
      return savedTheme
    } else {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
    }
  }

  const setTheme = (newMode: string) => {
    let finalMode = newMode
    if (newMode === 'system') {
      finalMode = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
    }
    setMode(finalMode)
    localStorage.setItem('theme', finalMode)
  }

  // getInitialTheme 函数用到了客户端才有的 localStorage，所以需要在客户端渲染时执行，这里使用 useEffect 来实现
  useEffect(() => {
    setMode(getInitialTheme())
  }, [])

  useEffect(() => {
    if (mode === 'dark') {
      document.documentElement.classList.remove('light')
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')
    }
  }, [mode])

  return (
    <ThemeContext.Provider value={{ mode, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
