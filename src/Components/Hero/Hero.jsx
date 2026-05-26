import React, { useRef, useEffect, useState, useCallback } from 'react'
import './Hero.css'
import resume from '../../assets/resume.pdf'
import { Link } from "react-router-dom";
import { motion } from 'framer-motion'
import ScrambleText from '../ScrambleText'
import MobileNav from '../MobileNav/MobileNav'

const Hero = () => {
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
        animate={{ opacity: 1 }}
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

        {/* ── Mobile hamburger + overlay ──────── */}
        <MobileNav />
      </motion.div>
    </div>
  );
};

export default Hero;
