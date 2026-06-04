import React from 'react'
import './LoadingIndicator.css'

export default function LoadingIndicator({ text }) {
  return (
    <div className="li">
      <div className="li__spinner" />
      <div className="li__text-wrap">
        {/* key forces remount on text change → restarts type-in animation */}
        <span key={text} className="li__text">{text}</span>
        <span className="li__cursor" />
      </div>
    </div>
  )
}
