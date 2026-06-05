import { useState, useRef, useEffect, useContext } from 'react'
import { useLocation } from 'react-router-dom'
import { ChatContext } from '../Chat/ChatContext'
import './AIMenu.css'

export default function AIMenu({ jarvisRef, jarvisMode }) {
  const [open, setOpen] = useState(false)
  const { isFloatingOpen, setIsFloatingOpen } = useContext(ChatContext)
  const location = useLocation()
  const isHero = location.pathname === '/'
  const menuRef = useRef(null)

  // Close on click outside
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleZacAI = () => {
    setIsFloatingOpen(v => !v)
    setOpen(false)
  }

  const handleJarvis = () => {
    if (jarvisMode === 'on') {
      jarvisRef.current?.deactivate()
    } else if (jarvisMode === 'off') {
      jarvisRef.current?.activate()
    }
    setOpen(false)
  }

  // JARVIS option only on hero page + desktop
  const showJarvis = isHero && window.innerWidth > 768
  const jarvisOn      = jarvisMode === 'on'
  const jarvisBooting = jarvisMode === 'booting'

  return (
    <div className="ai-menu" ref={menuRef}>
      {/* Popup — appears above the robot button */}
      <div className={`ai-menu__popup${open ? ' ai-menu__popup--open' : ''}`}>

        {showJarvis && (
          <button
            className={`ai-menu__option${jarvisOn ? ' ai-menu__option--jarvis-active' : ' ai-menu__option--jarvis'}`}
            onClick={handleJarvis}
            disabled={jarvisBooting}
          >
            {/* Hexagonal arc-reactor icon */}
            <svg className="ai-menu__option-icon" width="13" height="13" viewBox="0 0 13 13" fill="none">
              <polygon
                points="6.5,0.8 11.8,3.75 11.8,9.25 6.5,12.2 1.2,9.25 1.2,3.75"
                stroke="currentColor" strokeWidth="1.1"
                fill={jarvisOn ? 'currentColor' : 'none'} fillOpacity="0.18"
              />
              <circle cx="6.5" cy="6.5" r="2.2" fill="currentColor"/>
            </svg>
            <span className="ai-menu__option-label">
              {jarvisBooting ? 'LOADING...' : jarvisOn ? 'JARVIS ON' : 'JARVIS MODE'}
            </span>
            {jarvisOn && <span className="ai-menu__status-dot ai-menu__status-dot--jarvis" />}
          </button>
        )}

        <button
          className={`ai-menu__option${isFloatingOpen ? ' ai-menu__option--chat-active' : ' ai-menu__option--chat'}`}
          onClick={handleZacAI}
        >
          {/* Chat bubble icon */}
          <svg className="ai-menu__option-icon" width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path
              d="M1 1h11v8H7.5L5 12V9H1V1z"
              stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"
              fill={isFloatingOpen ? 'currentColor' : 'none'} fillOpacity="0.14"
            />
            <line x1="3" y1="4" x2="10" y2="4" stroke="currentColor" strokeWidth="0.9"/>
            <line x1="3" y1="6.2" x2="7.5" y2="6.2" stroke="currentColor" strokeWidth="0.9"/>
          </svg>
          <span className="ai-menu__option-label">zac.ai</span>
          {isFloatingOpen && <span className="ai-menu__status-dot ai-menu__status-dot--chat" />}
        </button>
      </div>

      {/* Orbiting text ring */}
      <svg className="ai-menu__ring-svg" width="80" height="80" viewBox="0 0 80 80" aria-hidden="true">
        <defs>
          <path id="ai-menu-ring" d="M 40 40 m -32 0 a 32 32 0 1 1 64 0 a 32 32 0 1 1 -64 0"/>
          <filter id="ai-menu-text-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#1a1818" floodOpacity="1"/>
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#1a1818" floodOpacity="1"/>
          </filter>
        </defs>
        <text fontSize="7" fontFamily="'Roboto Mono', monospace" fill="#dfdad3" letterSpacing="2.5" filter="url(#ai-menu-text-shadow)">
          <textPath href="#ai-menu-ring">
            {'AI CONTROLS · AI CONTROLS · '}
          </textPath>
        </text>
      </svg>

      {/* Robot toggle button */}
      <button
        className={[
          'ai-menu__btn',
          open        ? 'ai-menu__btn--open'   : '',
          jarvisOn    ? 'ai-menu__btn--jarvis'  : '',
        ].filter(Boolean).join(' ')}
        onClick={() => setOpen(v => !v)}
        aria-label="AI Controls"
        aria-expanded={open}
      >
        <svg
          className="ai-menu__robot"
          width="22" height="22" viewBox="0 0 22 22"
          fill="none" stroke="currentColor"
          strokeLinecap="round" strokeLinejoin="round"
        >
          {/* Antenna */}
          <line x1="11" y1="1.5" x2="11" y2="5" strokeWidth="1.5"/>
          <circle cx="11" cy="1.5" r="1" fill="currentColor" stroke="none"/>
          {/* Head */}
          <rect x="2.5" y="5" width="17" height="13" rx="2.5" strokeWidth="1.5"/>
          {/* Eyes */}
          <circle cx="7.5" cy="10.5" r="1.75" fill="currentColor" stroke="none"/>
          <circle cx="14.5" cy="10.5" r="1.75" fill="currentColor" stroke="none"/>
          {/* Mouth */}
          <line x1="7.5" y1="14.5" x2="14.5" y2="14.5" strokeWidth="1.5"/>
          {/* Ear nubs */}
          <line x1="2.5" y1="9.5" x2="0.5" y2="9.5" strokeWidth="1.5"/>
          <line x1="19.5" y1="9.5" x2="21.5" y2="9.5" strokeWidth="1.5"/>
        </svg>
      </button>
    </div>
  )
}
