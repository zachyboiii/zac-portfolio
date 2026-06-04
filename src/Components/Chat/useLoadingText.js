import { useState, useEffect } from 'react'

const MESSAGES = [
  'wait ah...',
  'lemme cook...',
  'aiya, hold on...',
  'wlao, thinking...',
  'one moment ah...',
  'eh can wait...',
  'almost there ah...',
]

export function useLoadingText(isLoading) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!isLoading) {
      setIndex(0)
      return
    }
    const id = setInterval(() => {
      setIndex(i => (i + 1) % MESSAGES.length)
    }, 2000)
    return () => clearInterval(id)
  }, [isLoading])

  return MESSAGES[index]
}
