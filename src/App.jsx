import React, { useEffect, useRef, useState, useCallback } from 'react'
import { HashRouter as Router } from 'react-router-dom'
import AnimatedRoutes from './Components/AnimatedRoutes'
import { motion, useMotionValue, useSpring, animate } from 'framer-motion'
import { ChatProvider } from './Components/Chat/ChatContext'
import FloatingBot from './Components/Chat/FloatingBot'
import GestureControl from './Components/GestureControl/GestureControl'
import AIMenu from './Components/AIMenu/AIMenu'
import './App.css'

const PADDING = 10;
const DEFAULT_SIZE = 50;
const CLICKABLE = 'a, button, [role="button"], input[type="submit"], input[type="button"]';
const IS_MOBILE = window.matchMedia('(max-width: 768px)').matches;

const App = () => {
  const rawX = useMotionValue(-200);
  const rawY = useMotionValue(-200);
  const rawW = useMotionValue(DEFAULT_SIZE);
  const rawH = useMotionValue(DEFAULT_SIZE);
  const rotation = useMotionValue(0);

  const x = useSpring(rawX, { stiffness: 800, damping: 40 });
  const y = useSpring(rawY, { stiffness: 800, damping: 40 });
  const w = useSpring(rawW, { stiffness: 600, damping: 35 });
  const h = useSpring(rawH, { stiffness: 600, damping: 35 });

  const jarvisRef = useRef(null);
  const [jarvisMode, setJarvisMode] = useState('off');

  const [isLocked, setIsLocked] = useState(false);
  const lockedRef = useRef(false);  // fully expanded on element
  const lockingRef = useRef(false); // rotation-to-upright in progress
  const spinRef = useRef(null);

  const startSpin = useCallback(() => {
    if (spinRef.current) spinRef.current.stop();
    const from = rotation.get();
    spinRef.current = animate(rotation, from + 360 * 10000, {
      duration: 6 * 10000,
      ease: 'linear',
    });
  }, [rotation]);

  // Always snaps back to 0° (nearest full rotation), returns a Promise
  const stopSpin = useCallback(() => {
    if (spinRef.current) spinRef.current.stop();
    const raw = rotation.get();
    const mod = ((raw % 360) + 360) % 360;
    const snapped = mod > 180 ? raw - mod + 360 : raw - mod;
    return new Promise(resolve => {
      animate(rotation, snapped, { duration: 0.1, ease: 'easeOut', onComplete: resolve });
    });
  }, [rotation]);

  useEffect(() => {
    if (IS_MOBILE) return;
    startSpin();
  }, [startSpin]);

  useEffect(() => {
    if (IS_MOBILE) return;
    const onMove = (e) => {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const target = el?.closest(CLICKABLE);

      if (target) {
        if (!lockedRef.current && !lockingRef.current) {
          // Phase 1: start rotation back to upright, keep following mouse
          lockingRef.current = true;
          rawX.set(e.clientX - DEFAULT_SIZE / 2);
          rawY.set(e.clientY - DEFAULT_SIZE / 2);
          stopSpin().then(() => {
            if (!lockingRef.current) return; // aborted while rotating
            const r = target.getBoundingClientRect();
            rawX.set(r.left - PADDING);
            rawY.set(r.top - PADDING);
            rawW.set(r.width + PADDING * 2);
            rawH.set(r.height + PADDING * 2);
            lockedRef.current = true;
            lockingRef.current = false;
            setIsLocked(true);
          });
        } else if (lockingRef.current) {
          // Phase 2: still rotating, keep following mouse
          rawX.set(e.clientX - DEFAULT_SIZE / 2);
          rawY.set(e.clientY - DEFAULT_SIZE / 2);
        } else if (lockedRef.current) {
          // Phase 3: fully locked, track element position
          const rect = target.getBoundingClientRect();
          rawX.set(rect.left - PADDING);
          rawY.set(rect.top - PADDING);
          rawW.set(rect.width + PADDING * 2);
          rawH.set(rect.height + PADDING * 2);
        }
      } else {
        rawX.set(e.clientX - DEFAULT_SIZE / 2);
        rawY.set(e.clientY - DEFAULT_SIZE / 2);
        rawW.set(DEFAULT_SIZE);
        rawH.set(DEFAULT_SIZE);

        if (lockedRef.current || lockingRef.current) {
          lockedRef.current = false;
          lockingRef.current = false;
          setIsLocked(false);
          startSpin();
        }
      }
    };

    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [startSpin, stopSpin, rawX, rawY, rawW, rawH]);

  return (
    <ChatProvider>
      <Router>
        <motion.div
          className="camera-cursor"
          style={{ x, y, width: w, height: h }}
        >
          <motion.div
            className="corner-wrapper"
            style={{ rotate: rotation }}
          >
            <div className="corner tl" />
            <div className="corner tr" />
            <div className="corner bl" />
            <div className="corner br" />
            <div className={`center-dot${isLocked ? ' is-plus' : ''}`} />
          </motion.div>
        </motion.div>

        <AnimatedRoutes />
        <FloatingBot />
        {/* GestureControl must be inside <Router> so it can call useNavigate */}
        <GestureControl ref={jarvisRef} onModeChange={setJarvisMode} />
        <AIMenu jarvisRef={jarvisRef} jarvisMode={jarvisMode} />
      </Router>
    </ChatProvider>
  );
};

export default App
