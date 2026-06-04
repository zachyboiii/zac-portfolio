import React, { useRef, useEffect, useState, useCallback, useContext } from 'react'
import './Hero.css'
import resume from '../../assets/resume.pdf'
import { Link } from "react-router-dom";
import { motion } from 'framer-motion'
import ScrambleText from '../ScrambleText'
import MobileNav from '../MobileNav/MobileNav'
import ZacAI from '../Chat/ZacAI'
import { ChatContext } from '../Chat/ChatContext'

const Hero = () => {
  const { openZacAI, isZacAIOpen } = useContext(ChatContext)

  // Evaluated once at mount — avoids a re-render, safe for SSR-free Vite builds
  const isMobile = useRef(
    typeof window !== 'undefined' && window.innerWidth <= 768
  ).current;

  const blobRef        = useRef(null);
  const overlayRef     = useRef(null);
  const targetPos      = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const currentPos     = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const rafRef         = useRef(null);
  const isTouchingRef  = useRef(false);
  const hasTouchedRef  = useRef(false);   // mobile: frozen until first touch
  const lastSplatRef   = useRef(0);
  const idleTimerRef   = useRef(null);

  const [isSplatting, setIsSplatting] = useState(false);
  const [isIdle,      setIsIdle]      = useState(true);

  /* ── Mark user as active, reset idle countdown ── */
  const markActive = useCallback(() => {
    setIsIdle(false);
    clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      setIsIdle(true);
      targetPos.current = {
        x: window.innerWidth  / 2,
        y: window.innerHeight / 2,
      };
    }, 3000);
  }, []);

  useEffect(() => {
    /* ── Mouse (desktop) ─────────────────────────── */
    const onMouseMove = (e) => {
      targetPos.current = { x: e.clientX, y: e.clientY };
      markActive();
    };

    /* ── First touch: unlock mobile movement ─────────────────────
       Always sets hasTouched so gyro activates, but only repos the
       blob if the user tapped the open page (not a link/button).   */
    const onTouchStart = (e) => {
      hasTouchedRef.current = true;
      isTouchingRef.current = true;
      if (!e.target.closest('a, button, [role="button"]')) {
        const t = e.touches[0];
        targetPos.current = { x: t.clientX, y: t.clientY };
        markActive();
      }
    };

    /* ── Ongoing touch drag ───────────────────────── */
    const onTouchMove = (e) => {
      if (!hasTouchedRef.current) return;
      const t = e.touches[0];
      targetPos.current = { x: t.clientX, y: t.clientY };
      markActive();
    };

    const onTouchEnd = () => {
      setTimeout(() => { isTouchingRef.current = false; }, 200);
    };

    /* ── Gyroscope (mobile, only after first touch) ─ */
    const onOrientation = (e) => {
      if (!hasTouchedRef.current) return;   // frozen at center until user interacts
      if (isTouchingRef.current)  return;   // touch takes priority
      const gamma = Math.max(-40, Math.min(40, e.gamma ?? 0));
      const beta  = Math.max(10,  Math.min(70, e.beta  ?? 45));
      const xR    = (gamma + 40) / 80;
      const yR    = (beta  - 10) / 60;
      targetPos.current = {
        x: window.innerWidth  * (0.2 + xR * 0.6),
        y: window.innerHeight * (0.25 + yR * 0.5),
      };
      markActive();
    };

    window.addEventListener('mousemove',         onMouseMove,   { passive: true });
    window.addEventListener('touchstart',        onTouchStart,  { passive: true });
    window.addEventListener('touchmove',         onTouchMove,   { passive: true });
    window.addEventListener('touchend',          onTouchEnd,    { passive: true });
    window.addEventListener('deviceorientation', onOrientation, { passive: true });

    /* ── rAF: lerp blob + spotlight toward target ── */
    const animate = () => {
      const LERP = 0.04;
      currentPos.current.x += (targetPos.current.x - currentPos.current.x) * LERP;
      currentPos.current.y += (targetPos.current.y - currentPos.current.y) * LERP;

      const x = currentPos.current.x;
      const y = currentPos.current.y;

      /* Blob: position + dynamic colour */
      const el = blobRef.current;
      if (el) {
        const hw = el.offsetWidth  / 2;
        const hh = el.offsetHeight / 2;
        el.style.left = `${x - hw}px`;
        el.style.top  = `${y - hh}px`;

        const xR    = Math.max(0, Math.min(1, x / window.innerWidth));
        const yR    = Math.max(0, Math.min(1, y / window.innerHeight));
        const angle = 45 + xR * 90;
        const h1    = 262 + xR * 60;
        const s1    = 80  + yR * 12;
        const l1    = 33  + yR * 14;
        const h2    = 52  - xR * 22;
        el.style.backgroundImage =
          `linear-gradient(${angle}deg, hsl(${h1},${s1}%,${l1}%), hsl(${h2},85%,68%))`;
      }

      /* Spotlight overlay: dark veil with transparent hole at blob centre */
      const ov = overlayRef.current;
      if (ov) {
        ov.style.background =
          `radial-gradient(circle at ${x}px ${y}px,` +
          ` transparent 0px,` +
          ` transparent 200px,` +
          ` rgba(26,24,24,0.57) 380px,` +
          ` rgba(26,24,24,0.70) 560px)`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(idleTimerRef.current);
      window.removeEventListener('mousemove',         onMouseMove);
      window.removeEventListener('touchstart',        onTouchStart);
      window.removeEventListener('touchmove',         onTouchMove);
      window.removeEventListener('touchend',          onTouchEnd);
      window.removeEventListener('deviceorientation', onOrientation);
    };
  }, [markActive]);

  /* ── Splat on desktop click only (no bounce on mobile touch) ── */
  const handleBlobPointerDown = useCallback((e) => {
    if (e.pointerType === 'touch') return;   // touch → just follow, no splat
    const now = Date.now();
    if (isSplatting || now - lastSplatRef.current < 800) return;
    lastSplatRef.current = now;
    markActive();
    setIsSplatting(true);
    setTimeout(() => setIsSplatting(false), 720);
  }, [isSplatting, markActive]);

  const blobClass = [
    'gradient',
    isIdle      ? 'gradient--idle'  : '',
    isSplatting ? 'gradient--splat' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className='hero-page'>
      {/* ── Blob: outside fade wrapper so it's visible immediately
           on mobile with no entry animation ──────────────────── */}
      <div
        ref={blobRef}
        className={blobClass}
        onPointerDown={handleBlobPointerDown}
        aria-hidden="true"
      />

      {/* ── Everything else fades in on desktop (instant on mobile) ── */}
      <motion.div
        className='hero-content'
        initial={{ opacity: isMobile ? 1 : 0 }}
        animate={{ opacity: isZacAIOpen ? 0 : 1 }}
        exit={{ opacity: 1 }}
        transition={{ duration: isMobile ? 0 : 1 }}
      >
        {/* ── Mobile sticky bar ───────────────── */}
        <div className="hero-mobile-bar" aria-hidden="true" />

        {/* ── Spotlight overlay (desktop only) ── */}
        <div ref={overlayRef} className="hero-spotlight" aria-hidden="true" />

        {/* ── Summary (top-left) ──────────────── */}
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

        

        {/* ── Coordinates label (bottom-right) ── */}
        <div className="hero-coords" aria-hidden="true">01.35°N · 103.82°E</div>

        {/* ── Desktop nav (right side) ─────────── */}
        <div className="hero-right">
          <ul className="hero-menu">
            <li className='work'><Link to='/work'>WORK</Link></li>
            <li className='about'><Link to='/about'>ABOUT</Link></li>
            <li className='contact'><Link to='/contact'>CONTACT</Link></li>
          </ul>
        </div>

        {/* ── Resume button ───────────────────── */}
        <div className="hero-resume">
          <a href={resume} download>Download Resume</a>
        </div>

        {/* ── Social icons ────────────────────── */}
        <div className="hero-social">
          <a href="https://github.com/zachyboiii" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
            </svg>
          </a>
          <a href="https://www.linkedin.com/in/zachary-lee-ky/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </a>
        </div>

        {/* ── Mobile hamburger + overlay ──────── */}
        <MobileNav />
      </motion.div>

      {/* ── ZacAI full interface (Hero-only, Mode 2) ── */}
      <ZacAI />
    </div>
  );
};

export default Hero;
