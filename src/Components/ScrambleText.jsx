import { useState, useEffect, useRef } from 'react'

/**
 * Terminal-style character-scramble animation.
 * Works especially well with monospace fonts — every glyph
 * is the same width, so the layout never shifts during decode.
 *
 * Props
 *  text    — the final string to reveal
 *  delay   — ms before animation starts  (default: 0)
 *  speed   — ms between frames            (default: 28)
 *  cursor  — show blinking block cursor   (default: true)
 */

// Characters that look great in Roboto Mono
const GLYPHS = '!<>-_\\/[]{}|=+*^?~;:.#@%0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

const rand = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)]

const ScrambleText = ({ text, delay = 0, speed = 28, cursor = true }) => {
  // Start fully scrambled (whitespace stays whitespace)
  const [display, setDisplay] = useState(() =>
    text.replace(/\S/g, rand)
  )
  const [done, setDone] = useState(false)
  const intervalRef = useRef(null)
  const timeoutRef = useRef(null)

  useEffect(() => {
    let progress = 0

    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        progress += 2 // chars revealed per frame — tune for pace

        setDisplay(
          text.split('').map((ch, i) => {
            if (/\s/.test(ch)) return ch          // keep whitespace intact
            if (i < Math.floor(progress)) return ch // already revealed
            return rand()                           // still scrambling
          }).join('')
        )

        if (progress >= text.length) {
          clearInterval(intervalRef.current)
          setDisplay(text)
          setDone(true)
        }
      }, speed)
    }, delay)

    return () => {
      clearTimeout(timeoutRef.current)
      clearInterval(intervalRef.current)
    }
  }, [text, delay, speed])

  return (
    <span className="scramble-text">
      {display}
      {cursor && (
        <span className="scramble-cursor" aria-hidden="true">▍</span>
      )}
    </span>
  )
}

export default ScrambleText
