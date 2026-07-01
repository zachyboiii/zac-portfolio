import React, { useState, useEffect } from 'react'
import '../Work/Work.css'
import horiLine from '../../assets/hori-line-dark.svg'
import { Link } from "react-router-dom"
import work_data from '../../assets/workdata'
import experience_data from '../../assets/experienceData'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import ScrambleText from '../ScrambleText'
import MobileNav from '../MobileNav/MobileNav'
import usePageMeta from '../usePageMeta'

const WORK_DESC_1 =
  "A look at what I've built and where I've worked — from personal and school projects to real-world internships."

const WORK_DESC_2 =
  "Each reflects my drive to learn fast, take on new challenges, and grow beyond what I already know."

const Work = () => {
  usePageMeta(
    'Work — Zachary Lee | Projects & Experience',
    "A look at Zachary Lee's projects and work experience, including AI engineering internships, RAG systems, and full-stack applications."
  )
  const location = useLocation()
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const [fontsReady, setFontsReady]   = useState(false)
  const [activeTab, setActiveTab]     = useState(location.state?.tab || 'projects')
  const [expandedItems, setExpandedItems] = useState(new Set())

  const toggleExpanded = (id) => {
    setExpandedItems(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  useEffect(() => {
    document.fonts.ready.then(() => setFontsReady(true))
  }, [])

  const placeholder = (text) => (
    <span style={{ visibility: 'hidden' }} aria-hidden="true">{text}</span>
  )

  return (
    <motion.div
      className='work-page'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* ── Sticky left panel ───────────── */}
      <div className="work-left">
        <nav className="work-nav">
          <Link to="/" className="desktop-only">home</Link>
          <img src={horiLine} alt="" aria-hidden="true" />
        </nav>

        <MobileNav theme="light" />

        {/* work-main: desc + tabs grouped and centred vertically */}
        <div className="work-main">
          <div className="work-desc">
            <p><strong>Work</strong></p>

            {/* Para 1 — mobile + desktop; cursor on mobile via CSS */}
            <p className="work-desc-body">
              {fontsReady
                ? <ScrambleText text={WORK_DESC_1} delay={300} />
                : placeholder(WORK_DESC_1)
              }
            </p>

            {/* Para 2 — desktop only; cursor lives here */}
            <p className="work-desc-body work-desc-body--2">
              {fontsReady
                ? <ScrambleText text={WORK_DESC_2} delay={900} />
                : placeholder(WORK_DESC_2)
              }
            </p>
          </div>

          {/* ── Tab switcher ──────────────── */}
          <div className="work-tabs">
            <p className="work-tabs-label">// view</p>
            <div className="work-tab-list">
              <button
                className={`work-tab-btn${activeTab === 'projects' ? ' active' : ''}`}
                onClick={() => setActiveTab('projects')}
              >
                projects
              </button>
              <span className="work-tab-sep" aria-hidden="true">|</span>
              <button
                className={`work-tab-btn${activeTab === 'experience' ? ' active' : ''}`}
                onClick={() => setActiveTab('experience')}
              >
                experience
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Scrolling right panel ────────── */}
      <div className="work-right">
        <AnimatePresence mode="wait">

          {activeTab === 'projects' && (
            <motion.div
              key="projects"
              className="work-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {work_data.map((proj, index) => (
                <div key={proj.id} className={`work-list${expandedItems.has(proj.id) ? ' is-expanded' : ''}`}>
                  <span className="work-index">{String(index + 1).padStart(2, '0')}</span>
                  <Link to={`/work/${proj.id}`} className="project-title-link">
                    {proj.w_title}
                  </Link>
                  <h2>{proj.w_date}</h2>

                  {/* Expand toggle — mobile only */}
                  <button
                    className="work-expand-btn"
                    onClick={() => toggleExpanded(proj.id)}
                    aria-expanded={expandedItems.has(proj.id)}
                  >
                    <span>{expandedItems.has(proj.id) ? 'Hide info' : 'More info'}</span>
                    <svg className="expand-chevron" width="12" height="7" viewBox="0 0 14 8"
                      fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 1l6 6 6-6" />
                    </svg>
                  </button>

                  {/* Collapsible: desc + tags */}
                  <div className="work-collapsible">
                    <h3>{proj.w_desc}</h3>
                    <div className="lang-list">
                      {proj.w_languages.map((lang, idx) => (
                        <div key={idx} className="language">
                          <p><strong>{lang}</strong></p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'experience' && (
            <motion.div
              key="experience"
              className="exp-timeline"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {experience_data.map((exp, index) => (
                <div key={exp.id} className="exp-node">

                  {/* ── Content card ── */}
                  <div className={`exp-card${expandedItems.has(exp.id) ? ' is-expanded' : ''}`}>
                    <span className="exp-type">// {exp.e_type}</span>

                    {exp.e_link ? (
                      <a
                        href={exp.e_link}
                        className="exp-company"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {exp.e_company}
                      </a>
                    ) : (
                      <span className="exp-company">{exp.e_company}</span>
                    )}

                    <p className="exp-role">{exp.e_role}</p>
                    <p className="exp-date">{exp.e_date}</p>

                    {/* Expand toggle — mobile only */}
                    <button
                      className="work-expand-btn"
                      onClick={() => toggleExpanded(exp.id)}
                      aria-expanded={expandedItems.has(exp.id)}
                    >
                      <span>{expandedItems.has(exp.id) ? 'Hide info' : 'More info'}</span>
                      <svg className="expand-chevron" width="12" height="7" viewBox="0 0 14 8"
                        fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 1l6 6 6-6" />
                      </svg>
                    </button>

                    {/* Collapsible: desc + skills */}
                    <div className="work-collapsible">
                      <p className="exp-desc">{exp.e_desc}</p>
                      <div className="lang-list exp-skills">
                        {exp.e_skills.map((skill, idx) => (
                          <div key={idx} className="language">
                            <p>{skill}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* ── Track: connecting line + dot ── */}
                  <div className="exp-node-track">
                    <div className={`exp-track-line${index === 0 ? ' exp-track-line--hidden' : ''}`} />
                    <div className={`exp-dot${exp.e_current ? ' exp-dot--current' : ''}`} aria-hidden="true" />
                    <div className={`exp-track-line${index === experience_data.length - 1 ? ' exp-track-line--hidden' : ''}`} />
                  </div>

                </div>
              ))}
            </motion.div>
          )}

        </AnimatePresence>

        <p onClick={scrollToTop} className="work-to-top">back to top</p>
      </div>
    </motion.div>
  )
}

export default Work
