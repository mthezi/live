"use client"
import React from 'react'
import MarkdownPreview from '@uiw/react-markdown-preview';

interface ParseHtmlProps {
  data: string
}

const ParseHtml = ({ data }: ParseHtmlProps) => {
  return (
    <>
      <MarkdownPreview source={data} />
    </>
  )
}

export default ParseHtml
