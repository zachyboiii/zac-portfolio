import React from 'react'
import '../Work/Work.css'
import horiLine from '../../assets/hori-line-dark.svg'
import { Link } from "react-router-dom"
import work_data from '../../assets/workdata'
import {motion} from 'framer-motion'; 


const Work = () => {
  return (
    <motion.div className='work-page'
        initial ={{opacity: 0}}
        animate={{opacity: 1}}
        exit = {{opacity:1}}
        transition={{duration: 1}}>
      <div className="work-top">
        <Link to="/">home</Link>
        <img src={horiLine} alt="" />
      </div>
      <div className="work-desc">
        <p><strong>Work</strong></p>
        <br />
        <p>Here are some of the projects I’ve worked on, be it in my own time or in school. </p>
        <br />
        <p>These projects are not only a showcase of my skills but also of my willingness and independence in learning. </p>
      </div>
      <div className="work-container">
        {work_data.map((proj, index) => {
          return (
            <div key={index} className="work-list">
              <a href={proj.w_link} target="_blank">{proj.w_title}</a>
              <h2>{proj.w_date}</h2>
              <h3>{proj.w_desc}</h3>
              <div className="lang-list">
                {proj.w_languages.map((lang, idx) => {
                  return <div key={idx} className="language">
                    <p><strong>{lang}</strong></p>
                  </div>
                })}
              </div>
            </div>
          )
        })}
      </div>
      <div className="work-to-top">
        <a href="#">back to top</a>
      </div>

    </motion.div>
  )
}

export default Work