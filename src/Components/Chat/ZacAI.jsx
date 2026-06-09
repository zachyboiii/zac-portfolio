import React, { useState, useRef, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChatContext } from './ChatContext'
import { useLoadingText } from './useLoadingText'
import LoadingIndicator from './LoadingIndicator'
import './ZacAI.css'

function renderContent(text) {
  return text.split(/\*\*(.*?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
  )
}

const SUGGESTIONS = [
  { label: "Projects", text: "What projects has Zac built?" },
  { label: "Experience", text: "Where has Zac worked?" },
  { label: "Skills", text: "What are Zac's technical skills?" },
  { label: "Background", text: "Tell me about Zac's education and background." },
]

export default function ZacAI() {
  const navigate = useNavigate()
  const {
    messages, isLoading,
    isZacAIOpen,
    isSidebarOpen, setIsSidebarOpen,
    sendMessage, clearMessages,
    minimizeToFloat, closeZacAI,
    suggestion, clearSuggestion,
  } = useContext(ChatContext)

  const handleSuggestionYes = () => {
    clearSuggestion()
    closeZacAI()
    navigate(suggestion.path, { state: { tab: suggestion.tab } })
  }

  const [input, setInput]       = useState('')
  const messagesEndRef          = useRef(null)
  const textareaRef             = useRef(null)
  const inputAreaRef            = useRef(null)
  const loadingText             = useLoadingText(isLoading)

  useEffect(() => {
    if (isZacAIOpen) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 60)
    }
  }, [messages, isZacAIOpen])

  useEffect(() => {
    if (isZacAIOpen) {
      setTimeout(() => textareaRef.current?.focus(), 200)
    }
  }, [isZacAIOpen])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || isLoading) return
    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
    await sendMessage(text)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInputChange = (e) => {
    setInput(e.target.value)
    const ta = e.target
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px'
  }

  const handleNewChat = () => {
    clearMessages()
    setInput('')
    textareaRef.current?.focus()
  }

  if (!isZacAIOpen) return null

  const hasMessages = messages.length > 0

  return (
    <div className="zai">
      {/* ── Sidebar ────────────────────────────── */}
      <aside className={`zai__sidebar ${isSidebarOpen ? 'zai__sidebar--open' : ''}`}>
        <div className="zai__sidebar-top">
          <span className="zai__brand">zac.ai</span>
          <button
            className="zai__sidebar-close"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Collapse sidebar"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M10 1L4 7L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <button className="zai__new-chat" onClick={handleNewChat}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1V11M1 6H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          New Chat
        </button>

        <div className="zai__sidebar-info">
          <p>Ask anything about<br />Zachary Lee.</p>
        </div>

        <nav className="zai__sidebar-nav">
          <span className="zai__sidebar-nav-label">Pages</span>
          {[
            { label: 'Work',    path: '/work' },
            { label: 'About',   path: '/about' },
            { label: 'Contact', path: '/contact' },
          ].map(({ label, path }) => (
            <button
              key={path}
              className="zai__sidebar-nav-link"
              onClick={() => { closeZacAI(); navigate(path) }}
            >
              {label}
            </button>
          ))}
        </nav>
      </aside>

      {/* ── Main area ──────────────────────────── */}
      <div className="zai__main">
        {/* Top bar */}
        <div className="zai__topbar">
          {!isSidebarOpen && (
            <button
              className="zai__topbar-btn"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Expand sidebar"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M4 1L10 7L4 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
          <div className="zai__topbar-actions">
            <button
              className="zai__topbar-btn"
              onClick={minimizeToFloat}
              title="Minimize to chat widget"
              aria-label="Minimize"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M13 1L1 13M1 13H7M1 13V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button
              className="zai__topbar-btn"
              onClick={closeZacAI}
              title="Close"
              aria-label="Close"
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M1 1L12 12M12 1L1 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Message area or hero landing */}
        <div className="zai__content">
          {!hasMessages ? (
            <div className="zai__landing">
              <h1 className="zai__heading">zac.ai</h1>
              <p className="zai__subheading">Ask me anything about Zachary.</p>
              <div className="zai__chips">
                {SUGGESTIONS.map(s => (
                  <button
                    key={s.label}
                    className="zai__chip"
                    onClick={() => sendMessage(s.text)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="zai__messages">
              {messages.map((m, i) => (
                <div key={i} className={`zai__msg zai__msg--${m.role}`}>
                  {m.role === 'assistant' && (
                    <span className="zai__msg-label">
                      <svg width="13" height="13" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                        <rect x="2.5" y="2.5" width="7" height="7" rx="0.75" stroke="currentColor" strokeWidth="1"/>
                        <line x1="6" y1="0.5" x2="6" y2="2.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                        <line x1="6" y1="9.5" x2="6" y2="11.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                        <line x1="0.5" y1="6" x2="2.5" y2="6" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                        <line x1="9.5" y1="6" x2="11.5" y2="6" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                        <rect x="4.5" y="4.5" width="1" height="1" fill="currentColor"/>
                        <rect x="6.5" y="4.5" width="1" height="1" fill="currentColor"/>
                        <line x1="4.5" y1="7" x2="7.5" y2="7" stroke="currentColor" strokeWidth="0.75" strokeLinecap="round"/>
                      </svg>
                      zac.ai
                    </span>
                  )}
                  <div className="zai__msg-bubble">{renderContent(m.content)}</div>
                </div>
              ))}
              {isLoading && <LoadingIndicator text={loadingText} />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Page suggestion prompt */}
        {suggestion && !isLoading && (
          <div className="zai__suggestion">
            <span>want to see more details?</span>
            <div className="zai__suggestion-btns">
              <button onClick={handleSuggestionYes}>yes</button>
              <button onClick={clearSuggestion}>no</button>
            </div>
          </div>
        )}

        {/* Input bar */}
        <div className="zai__input-wrap" ref={inputAreaRef}>
          <div className="zai__input-box">
            <textarea
              ref={textareaRef}
              className="zai__input"
              placeholder="Ask about Zachary…"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={isLoading}
            />
            <button
              className="zai__send"
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              aria-label="Send"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L8 15M8 1L3 6M8 1L13 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          <p className="zai__disclaimer">Answers are limited to info about Zachary Lee.</p>
        </div>
      </div>
    </div>
  )
}
