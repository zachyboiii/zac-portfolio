import React from 'react'
import './Hero.css'
import horiLine from '../../assets/hori-line.svg'
import resume from '../../assets/resume.pdf'
import { Link } from "react-router-dom";
import {motion} from 'framer-motion'

const Hero = () => {
  return (
    <motion.div 
    className='hero-page'
    initial ={{opacity: 0}}
    animate={{opacity: 1}}
    exit = {{opacity:1}}
    transition={{duration: 1}}>
        <div className="hero-left">
            <div className="summary">
                <p><strong>Zachary Lee</strong></p>
                <br />
                <p>Computer Science and Design Student in the Singapore University of Technology and Design, specializing in AI</p>
                <br />
                <p>Welcome.</p>
            </div>
            
        </div>
        <div className='hero-right'>
            <ul className="hero-menu">
                <li className='work'>
                <Link to='/work'>WORK</Link>
                </li>
                <li className='about'>
                    <Link to='/about'>ABOUT</Link>
                </li>
                <li className='contact'>
                    <Link to='/contact'>CONTACT</Link>
                </li>
            </ul>
        </div>
        <div className="hero-resume">
                <a href={resume} download>Download Resume</a>
        </div>
        <div className="hero-bottom">
            <ul className="bottom-menu">
                <a href="https://github.com/zachyboiii" target="_blank">gh</a>
                <a href="http://www.linkedin.com/in/zachary-lee-kl" target="_blank">in</a>
                <img src={horiLine} alt="" />
            </ul>
        </div>
        <div className="gradient"></div>

    </motion.div>
  )
}

export default Hero