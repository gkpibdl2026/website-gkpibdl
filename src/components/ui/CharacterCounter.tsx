'use client'

import { useState, useEffect } from 'react'

interface CharacterCounterProps {
  value: string
  maxLength?: number
  showWarningAt?: number // percentage, e.g., 80 means 80%
}

/**
 * Component to show character count for textarea/input
 */
export function CharacterCounter({ 
  value, 
  maxLength = 500, 
  showWarningAt = 80 
}: CharacterCounterProps) {
  const count = value.length
  const percentage = (count / maxLength) * 100
  const isWarning = percentage >= showWarningAt
  const isOver = count > maxLength

  return (
    <div className={`text-xs mt-1 text-right ${
      isOver ? 'text-red-500 dark:text-red-400 font-medium' :
      isWarning ? 'text-amber-500 dark:text-amber-400' :
      'text-gray-400 dark:text-gray-500'
    }`}>
      {count} / {maxLength}
      {isOver && <span className="ml-1">(melebihi batas!)</span>}
    </div>
  )
}

/**
 * Hook version for more control
 */
export function useCharacterCounter(value: string, maxLength: number = 500) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    setCount(value.length)
  }, [value])

  const percentage = (count / maxLength) * 100
  const remaining = maxLength - count
  const isOver = count > maxLength
  const isWarning = percentage >= 80

  return {
    count,
    maxLength,
    remaining,
    percentage,
    isOver,
    isWarning,
  }
}
