import React, { useState, useRef, useEffect, useContext } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ChatContext } from './ChatContext'
import { useLoadingText } from './useLoadingText'
import LoadingIndicator from './LoadingIndicator'
import './FloatingBot.css'

const SUGGESTIONS = [
  "What projects has Zac built?",
  "Where has Zac worked?",
  "What are Zac's AI skills?",
  "What is Zac studying?",
]

export default function FloatingBot() {
  const location = useLocation()
  const isHero = location.pathname === '/'

  const navigate = useNavigate()
  const {
    messages, isLoading,
    isFloatingOpen, setIsFloatingOpen,
    isZacAIOpen, sendMessage, openZacAI,
    suggestion, clearSuggestion,
  } = useContext(ChatContext)

  const handleSuggestionYes = () => {
    clearSuggestion()
    setIsFloatingOpen(false)
    navigate(suggestion.path, { state: { tab: suggestion.tab } })
  }

  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)
  const fbotRef = useRef(null)
  const loadingText = useLoadingText(isLoading)

  useEffect(() => {
    if (isFloatingOpen) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    }
  }, [messages, isFloatingOpen])

  useEffect(() => {
    if (!isFloatingOpen) return
    const handleClickOutside = (e) => {
      if (fbotRef.current && !fbotRef.current.contains(e.target)) {
        setIsFloatingOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [isFloatingOpen, setIsFloatingOpen])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || isLoading) return
    setInput('')
    textareaRef.current && (textareaRef.current.style.height = 'auto')
    await sendMessage(text)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = (e) => {
    setInput(e.target.value)
    const ta = e.target
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 100) + 'px'
  }

  // All hooks above — safe to conditionally return here
  if (isZacAIOpen) return null

  return (
    <div className="fbot" ref={fbotRef}>
      {/* Chat window */}
      <div className={`fbot__window ${isFloatingOpen ? 'fbot__window--open' : ''}`}>
        <div className="fbot__header">
          <span className="fbot__title">zac.ai</span>
          <div className="fbot__header-actions">
            {isHero && (
              <button
                className="fbot__icon-btn"
                onClick={openZacAI}
                title="Full view"
                aria-label="Expand to full view"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 13L13 1M13 1H7M13 1V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
            <button
              className="fbot__icon-btn"
              onClick={() => setIsFloatingOpen(false)}
              aria-label="Close chat"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="fbot__messages">
          {messages.length === 0 ? (
            <div className="fbot__empty">
              <p className="fbot__empty-title">Hi, I&apos;m <strong>zac.ai</strong></p>
              <p className="fbot__empty-sub">Ask me anything about Zachary.</p>
              <div className="fbot__suggestions">
                {SUGGESTIONS.map(s => (
                  <button key={s} className="fbot__suggestion" onClick={() => sendMessage(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, i) => (
              <div key={i} className={`fbot__msg fbot__msg--${m.role}`}>
                {m.content}
              </div>
            ))
          )}
          {isLoading && <LoadingIndicator text={loadingText} />}
          <div ref={messagesEndRef} />
        </div>

        {suggestion && !isLoading && (
          <div className="fbot__page-prompt">
            <span>want to see more details?</span>
            <div className="fbot__page-prompt-btns">
              <button onClick={handleSuggestionYes}>yes</button>
              <button onClick={clearSuggestion}>no</button>
            </div>
          </div>
        )}

        <div className="fbot__input-row">
          <textarea
            ref={textareaRef}
            className="fbot__input"
            placeholder="Ask about Zac…"
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={isLoading}
          />
          <button
            className="fbot__send"
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            aria-label="Send"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L7 13M7 1L2 6M7 1L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

    </div>
  )
}
