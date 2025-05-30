import React from 'react'
import Hero from './Hero/Hero'
import Work from './Work/Work'
import About from './About/About'
import Contact from './Contact/Contact'
import ProjectDetail from './Work/ProjectDetails'
import { Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'

function AnimatedRoutes() {
  const location = useLocation();
  return (
    
      <AnimatePresence>
        <Routes location ={location} key ={location.pathname}>
          <Route path="/" element={<Hero />} />
          <Route path="/work" element={<Work />} />
          <Route path="/work/:projectId" element={<ProjectDetail />}/>
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </AnimatePresence>
    
  );
}

export default AnimatedRoutes