import React from 'react'
import './Hero.css'
import resume from '../../assets/resume.pdf'
import { Link } from "react-router-dom";
import { motion } from 'framer-motion'
import ScrambleText from '../ScrambleText'
import MobileNav from '../MobileNav/MobileNav'

const Hero = () => {
  return (
    <motion.div
      className='hero-page'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* ── Gradient blob ─────────────────────── */}
      <div className="gradient" />

      {/* ── Summary (top-left) ────────────────── */}
      <div className="summary">
        <p><strong><ScrambleText text="Zachary Lee" delay={0} speed={30} cursor={false} /></strong></p>
        <p className="summary-body">
          <ScrambleText
            text={"Computer Science and Design Student in the Singapore University of Technology and Design, specializing in AI\n\nWelcome."}
            delay={400}
            speed={22}
          />
        </p>
      </div>

      {/* ── Coordinates label (bottom-right) ─── */}
      <div className="hero-coords" aria-hidden="true">01.35°N · 103.82°E</div>

      {/* ── Desktop nav (right side) ──────────── */}
      <div className="hero-right">
        <ul className="hero-menu">
          <li className='work'><Link to='/work'>WORK</Link></li>
          <li className='about'><Link to='/about'>ABOUT</Link></li>
          <li className='contact'><Link to='/contact'>CONTACT</Link></li>
        </ul>
      </div>

      {/* ── Resume button ─────────────────────── */}
      <div className="hero-resume">
        <a href={resume} download>Download Resume</a>
      </div>

      {/* ── Social links (bottom-left) ────────── */}
      <div className="hero-bottom">
        <ul className="bottom-menu">
          <a href="https://github.com/zachyboiii" target="_blank" rel="noopener noreferrer">gh</a>
          <a href="http://www.linkedin.com/in/zachary-lee-kl" target="_blank" rel="noopener noreferrer">in</a>
        </ul>
      </div>

      {/* ── Shared mobile hamburger + overlay ─── */}
      <MobileNav />
    </motion.div>
  );
};

export default Hero;
