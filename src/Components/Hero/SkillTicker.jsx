import React from 'react'
import aboutSkills from '../../assets/aboutdata'
import './SkillTicker.css'

const items = aboutSkills.flatMap(({ category, skills }) => [
  { type: 'category', label: category },
  ...skills.map(skill => ({ type: 'skill', label: skill })),
])

export default function SkillTicker() {
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker__track">
        {[...items, ...items].map((item, i) =>
          item.type === 'category' ? (
            <span key={i} className="ticker__category">{item.label}</span>
          ) : (
            <span key={i} className="ticker__skill">
              <span className="ticker__arrow">▲</span>
              {item.label}
            </span>
          )
        )}
      </div>
    </div>
  )
}
