import React, { createContext, useState, useCallback, useEffect } from 'react'
import { sendToOpenRouter } from './openrouter'
import { getFastPathResponse } from './fastPath'

export const ChatContext = createContext(null)

export function ChatProvider({ children }) {
  const [messages, setMessages]           = useState([])
  const [isLoading, setIsLoading]         = useState(false)
  const [isFloatingOpen, setIsFloatingOpen] = useState(false)
  const [isZacAIOpen, setIsZacAIOpen]     = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const sendMessage = useCallback(async (text) => {
    const userMsg = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setIsLoading(true)

    try {
      const fastReply = getFastPathResponse(text)
      if (fastReply) {
        setMessages(prev => [...prev, { role: 'assistant', content: fastReply }])
        setIsLoading(false)
        return
      }

      const history = [...messages, userMsg]
      let firstChunk = true

      // Append each streamed token to the last (assistant) message
      await sendToOpenRouter(history, (chunk) => {
        if (firstChunk) {
          firstChunk = false
          setIsLoading(false)
          setMessages(prev => [...prev, { role: 'assistant', content: chunk }])
        } else {
          setMessages(prev => {
            const updated = [...prev]
            const last = updated[updated.length - 1]
            updated[updated.length - 1] = { ...last, content: last.content + chunk }
            return updated
          })
        }
      })

      // If no chunks arrived at all
      if (firstChunk) {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I could not generate a response.' }])
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Please try again.' }])
    } finally {
      setIsLoading(false)
    }
  }, [messages])

  const clearMessages = useCallback(() => setMessages([]), [])

  // Clear on bfcache restore (browser back/forward navigation)
  useEffect(() => {
    const onPageShow = (e) => { if (e.persisted) setMessages([]) }
    window.addEventListener('pageshow', onPageShow)
    return () => window.removeEventListener('pageshow', onPageShow)
  }, [])

  const openZacAI = useCallback(() => {
    setIsZacAIOpen(true)
    setIsFloatingOpen(false)
  }, [])

  const closeZacAI = useCallback(() => {
    setIsZacAIOpen(false)
  }, [])

  const minimizeToFloat = useCallback(() => {
    setIsZacAIOpen(false)
    setIsFloatingOpen(true)
  }, [])

  return (
    <ChatContext.Provider value={{
      messages,
      isLoading,
      isFloatingOpen, setIsFloatingOpen,
      isZacAIOpen,
      isSidebarOpen, setIsSidebarOpen,
      sendMessage,
      clearMessages,
      openZacAI,
      closeZacAI,
      minimizeToFloat,
    }}>
      {children}
    </ChatContext.Provider>
  )
}
