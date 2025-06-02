import React from 'react'
import '../About/About.css'
import horiLine from '../../assets/hori-line.svg'
import { Link } from "react-router-dom";
import {motion} from 'framer-motion'
import selfPic from '../../assets/self-pic.svg'
import picBorder from '../../assets/pic-border.svg'
import resume from '../../assets/resume.pdf'
import aboutSkills from '../../assets/aboutdata'



const About = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <motion.div className='about-page'
            initial ={{opacity: 0}}
            animate={{opacity: 1}}
            exit = {{opacity:1}}
            transition={{duration: 1}}>
      <div className="about-top">
          <Link to="/">home</Link>
          <img src={horiLine} alt="" />
      </div>
      
      <div className="about-left">
        <div className="title">
          <h1>About</h1>
          <div className="profile-pic">
          <img className='border' src={picBorder} alt="" />
          <img className='dp' src={selfPic} alt="" />
          </div>
        </div>
        <h2>I'm Zachary. A designer, coder and problem solver.</h2>
        <div className="self-desc">
        <p>
          Hi, I am Zachary Lee, currently a student in Singapore University of
          Technology and Design (SUTD) majoring in computer science and graduating in
          2027. I have a <strong>strong passion in coding</strong> and aspire to pursue a career in 
          <strong> software development or artificial intelligence</strong>.
        </p>
        <br />
        <p>
          Having little to no background in coding before university, I was purely
          driven by my <strong>desire to learn</strong> and constantly sought opportunities to expand my
          skills, be it through personal or school based projects.      
        </p>
        <br />
        <p>
          A great example of my drive to learn independently is how I built this
          website—starting with almost zero knowledge of web development, HTML, CSS, or
          JavaScript. Through <strong>self-study and experimentation</strong>, I quickly gained
          proficiency in these technologies, allowing me to create this fully
          functional, user-friendly site.
        </p>
        <br />
        <p>
          Moreover, being a student of SUTD has taught me the <strong>art of design thinking</strong> as
          well as how to be <strong>creative in implementing solutions</strong>. Thus, this unique skill
          is what sets me apart and enables me to approach projects from both a
          technical and user-centric perspective.
        </p>
        <br />
        <p>
          As such, I can always compensate for lack of experiences with <strong>
            fast and
            independent learning
          </strong> to accomplish various tasks at hand.
        </p>
        <br />
        <p>
          In my spare time I love playing the guitar and trying my hand at various
          sports!
        </p>
        </div>
      </div>
  
  <div className="skills">
    <h2>Skills:</h2>
    <div className="skills-container">
      {aboutSkills.map((skill,index) => {
        return (
        <div key={index} className="skillsList">
          <p>{skill}</p>
        </div>
        );
      })}
    </div>
  </div>

  <div className="about-bottom">
    <Link className='contactMe' to="/contact">Contact Me</Link>
    <a className='resumeDownload' href={resume} download>Download Resume</a>
  </div>  
  <div className="to-top">
    <p onClick={scrollToTop} className="back-to-top-text">back to top</p>
  </div>
</motion.div>
  )
}

export default About