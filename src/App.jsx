import React, { useEffect, useState } from 'react'

import { HashRouter as Router} from 'react-router-dom'
import AnimatedRoutes from './Components/AnimatedRoutes'
import {motion, useMotionValue} from 'framer-motion' 
import './App.css'



const App = () => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (e) => {
      x.set(e.clientX - 25); // adjust offset for centering
      y.set(e.clientY - 25);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [x, y]);

  return (
    <Router>
      
      <motion.div
      className='camera-cursor'
      style={{
        x,
        y,
      }}
      >
        <motion.div 
        className="corner-wrapper" 
        animate={{ rotate: 360 }} 
        transition={{ repeat: Infinity, duration: 6, ease: "linear" }}>
          <div className="corner tl" />
          <div className="corner tr" />
          <div className="corner bl" />
          <div className="corner br" />
          <div className="center-dot" />
        </motion.div>
        
      </motion.div>
        
      <AnimatedRoutes />
    </Router>
  );
}

export default App
