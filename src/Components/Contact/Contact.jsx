import React from 'react'
import '../Contact/Contact.css'
import horiLine from '../../assets/hori-line-dark.svg'
import { Link } from "react-router-dom";
import {motion} from 'framer-motion'

const Contact = () => {
  return (
    <motion.div className='contact-page'
    initial ={{opacity: 0}}
    animate={{opacity: 1}}
    exit = {{opacity:1}}
    transition={{duration: 1}}>
      <div className="top-menu">
            <Link to="/">home</Link>
            <img src={horiLine} alt="" />
      </div>
      <div className="mainBody">
        <h1>Hello.</h1>
        <p className='desc'>Looking for a computer science intern who is willing to learn? Get in touch.</p>
        <br />
        <div className="email">
          <p><strong>Email:&nbsp;</strong></p>
          <a href="mailto:lkyzachary@gmail.com">lkyzachary@gmail.com&nbsp;|&nbsp;</a>
          
          <a href="mailto:1007875@mymail.sutd.edu.sg">1007875@mymail.sutd.edu.sg</a>
        </div>
        <div className="links">
          <p><strong>On The Internet:&nbsp;</strong></p>
          <a href="https://github.com/zachyboiii" target="_blank">Github&nbsp;|&nbsp;</a>
          
          <a href="http://www.linkedin.com/in/zachary-lee-kl" target="_blank">LinkedIn</a>
        </div>
      </div>
    </motion.div>
  )
}

export default Contact