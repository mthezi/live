'use client'
import { deleteAnswer } from '@/lib/actions/answer.action'
import { deleteQuestion } from '@/lib/actions/question.action'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import React from 'react'

interface EditDeleteActionProps {
  type: string
  itemId: string
}

const EditDeleteAction = ({ type, itemId }: EditDeleteActionProps) => {
  const pathname = usePathname()
  const router = useRouter()
  // TODO: 添加提示
  const handleEdit = async () => {
    if (type === 'question') {
      router.push(`/question/edit/${JSON.parse(itemId)}`)
    } else if (type === 'answer') {
      console.log('edit answer')
    }
  }

  const handleDelete = async () => {
    if (type === 'question') {
      await deleteQuestion({ questionId: JSON.parse(itemId), path: pathname })
    } else if (type === 'answer') {
      console.log('delete answer')
      await deleteAnswer({ answerId: JSON.parse(itemId), path: pathname })
    }
  }
  return (
    <div className='flex items-center justify-end gap-3 max-sm:w-full'>
      {type === 'question' && (
        <Image
          src='/assets/icons/edit.svg'
          alt='编辑'
          width={14}
          height={14}
          className='cursor-pointer object-contain'
          onClick={handleEdit}
        />
      )}
      <Image
        src='/assets/icons/trash.svg'
        alt='删除'
        width={14}
        height={14}
        className='cursor-pointer object-contain'
        onClick={handleDelete}
      />
    </div>
  )
}

export default EditDeleteAction
