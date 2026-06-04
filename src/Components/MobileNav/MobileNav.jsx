import React, { useState } from 'react'
import './MobileNav.css'
import resume from '../../assets/resume.pdf'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

/**
 * Shared mobile hamburger + full-screen nav overlay.
 * theme="dark"  → dark bg, beige text  (Hero, About, ProjectDetails)
 * theme="light" → beige bg, dark text  (Work, Contact)
 */
const MobileNav = ({ theme = 'dark' }) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)
  const t = `theme-${theme}`

  return (
    <>
      <button
        className={`hamburger ${t}${menuOpen ? ' is-open' : ''}`}
        onClick={() => setMenuOpen(o => !o)}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
      >
        <span />
        <span />
        <span />
      </button>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            className={`mobile-nav-overlay ${t}`}
            initial={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
            animate={{ opacity: 1, clipPath: 'inset(0 0 0% 0)' }}
            exit={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.45, ease: [0.76, 0, 0.24, 1] }}
          >
            <Link to="/"        onClick={closeMenu}>HOME</Link>
            <Link to="/work"    onClick={closeMenu}>WORK</Link>
            <Link to="/about"   onClick={closeMenu}>ABOUT</Link>
            <Link to="/contact" onClick={closeMenu}>CONTACT</Link>

            <div className="mob-nav-meta">
              <a href={resume} download onClick={closeMenu}>Download Resume</a>
              <div className="mob-nav-social">
                <a href="https://github.com/zachyboiii" target="_blank" rel="noopener noreferrer">gh</a>
                <a href="https://www.linkedin.com/in/zachary-lee-ky/" target="_blank" rel="noopener noreferrer">in</a>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  )
}

export default MobileNav
