import React from 'react'
import '../Contact/Contact.css'
import horiLine from '../../assets/hori-line-dark.svg'
import { Link } from "react-router-dom";
import { motion } from 'framer-motion'
import ScrambleText from '../ScrambleText'
import MobileNav from '../MobileNav/MobileNav'
import usePageMeta from '../usePageMeta'

const Contact = () => {
  usePageMeta(
    'Contact — Zachary Lee',
    'Get in touch with Zachary Lee for internship, full-time AI engineering, or software development opportunities. Reach out via email, GitHub, or LinkedIn.'
  )
  return (
    <motion.div
      className='contact-page'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* ── Nav ───────────────────────────── */}
      <div className="top-menu">
        <Link to="/" className="desktop-only">home</Link>
        <img src={horiLine} alt="" aria-hidden="true" />
      </div>

      {/* ── Shared mobile hamburger + overlay ─── */}
      <MobileNav theme="light" />

      {/* ── Main body ─────────────────────── */}
      <div className="mainBody">
        <h1>
          <ScrambleText text="Hello." delay={200} speed={28} cursor={false} />
        </h1>

        <p className="desc">
          <ScrambleText
            text="Looking for a computer science intern who is willing to learn? Get in touch."
            delay={650}
            speed={22}
          />
        </p>

        {/* ── Contact rows ───────────────── */}
        <div className="contact-grid">
          <div className="contact-row">
            <span className="contact-label">// email</span>
            <div className="contact-links">
              <a href="mailto:lkyzachary@gmail.com">lkyzachary@gmail.com</a>
              <span className="contact-sep" aria-hidden="true">|</span>
              <a href="mailto:1007875@mymail.sutd.edu.sg">1007875@mymail.sutd.edu.sg</a>
            </div>
          </div>

          <div className="contact-row">
            <span className="contact-label">// links</span>
            <div className="contact-links">
              <a href="https://github.com/zachyboiii" target="_blank" rel="noopener noreferrer">Github</a>
              <span className="contact-sep" aria-hidden="true">|</span>
              <a href="https://www.linkedin.com/in/zachary-lee-ky/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default Contact
