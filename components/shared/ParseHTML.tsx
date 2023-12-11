"use client"
import React from 'react'
import MarkdownPreview from '@uiw/react-markdown-preview';

interface ParseHtmlProps {
  data: string
}

const ParseHtml = ({ data }: ParseHtmlProps) => {
  return (
    <div className='w-full min-w-full markdown '>
      <MarkdownPreview source={data}/>
    </div>
  )
}

export default ParseHtml
