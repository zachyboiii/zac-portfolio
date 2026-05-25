import React, { useState, useEffect } from 'react'
import '../Work/Work.css'
import horiLine from '../../assets/hori-line-dark.svg'
import { Link } from "react-router-dom"
import work_data from '../../assets/workdata'
import { motion } from 'framer-motion'
import ScrambleText from '../ScrambleText'
import MobileNav from '../MobileNav/MobileNav'

// Text extracted as a constant so the invisible placeholder and ScrambleText
// always reference the same string — critical for identical line-wrapping.
const WORK_DESC =
  "Here are some of the projects I've worked on, be it in my own time or in school.\n\nThese projects are not only a showcase of my skills but also of my willingness and independence in learning."

const Work = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Wait for Roboto Mono to load before mounting ScrambleText.
  // Until then we render an invisible placeholder with the same text so the
  // paragraph is already sized with the correct font metrics — preventing the
  // FOUT-driven line-reflow that shifts the project list on mobile.
  const [fontsReady, setFontsReady] = useState(false)

  useEffect(() => {
    document.fonts.ready.then(() => setFontsReady(true))
  }, [])

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

        {/* ── Shared mobile hamburger + overlay ─── */}
        <MobileNav />
        <div className="work-desc">
          <p><strong>Work</strong></p>
          <p className="work-desc-body">
            {fontsReady
              ? (
                <ScrambleText
                  text={WORK_DESC}
                  delay={300}
                  cursor={false}
                />
              ) : (
                /* Invisible placeholder: occupies correct space while font loads */
                <span style={{ visibility: 'hidden' }} aria-hidden="true">
                  {WORK_DESC}
                </span>
              )
            }
          </p>
        </div>
      </div>

      {/* ── Scrolling right panel ────────── */}
      <div className="work-right">
        <div className="work-container">
          {work_data.map((proj, index) => (
            <div key={index} className="work-list">
              <span className="work-index">{String(index + 1).padStart(2, '0')}</span>
              <Link to={`/work/${proj.id}`} className="project-title-link">
                {proj.w_title}
              </Link>
              <h2>{proj.w_date}</h2>
              <h3>{proj.w_desc}</h3>
              <div className="lang-list">
                {proj.w_languages.map((lang, idx) => (
                  <div key={idx} className="language">
                    <p><strong>{lang}</strong></p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p onClick={scrollToTop} className="work-to-top">back to top</p>
      </div>
    </motion.div>
  );
};

export default Work;
