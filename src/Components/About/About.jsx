import React, { lazy, Suspense, Component } from 'react'
import '../About/About.css'
import horiLine from '../../assets/hori-line.svg'
import selfPic from '../../assets/self-pic.svg'
import picBorder from '../../assets/pic-border.svg'
import { Link } from "react-router-dom";
import { motion } from 'framer-motion'
import resume from '../../assets/resume.pdf'
import aboutSkills from '../../assets/aboutdata'
import MobileNav from '../MobileNav/MobileNav'

const Spline = lazy(() => import('@splinetool/react-spline'))

class SplineErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    if (this.state.failed) return this.props.fallback
    return this.props.children
  }
}

const About = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <motion.div
      className='about-page'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* ── Nav ─────────────────────────────── */}
      <nav className="about-nav">
        <Link to="/" className="desktop-only">home</Link>
        <img src={horiLine} alt="" aria-hidden="true" />
      </nav>

      {/* ── Shared mobile hamburger + overlay ─── */}
      <MobileNav />

      {/* ── Full-width heading ───────────────── */}
      <header className="about-header">
        <h1 className="about-heading">About</h1>
      </header>

      {/* ── Main 60 / 40 grid ───────────────── */}
      <div className="about-main">

        {/* Left — biography */}
        <div className="about-left-col">
          <p className="section-label">// biography</p>
          <h2 className="about-tagline">
            I'm Zachary. A designer, coder and problem solver.
          </h2>
          <div className="self-desc">
            <p>
              Hi, I am Zachary Lee, currently a student in Singapore University of
              Technology and Design (SUTD) majoring in computer science and graduating in
              2027. I have a <strong>strong passion in coding</strong> and aspire to pursue
              a career in <strong>software development or artificial intelligence</strong>.
            </p>
            <br />
            <p>
              Having little to no background in coding before university, I was purely
              driven by my <strong>desire to learn</strong> and constantly sought opportunities
              to expand my skills, be it through personal or school based projects.
            </p>
            <br />
            <p>
              A great example of my drive to learn independently is how I built this
              website—starting with almost zero knowledge of web development, HTML, CSS,
              or JavaScript. Through <strong>self-study and experimentation</strong>, I quickly
              gained proficiency in these technologies, allowing me to create this fully
              functional, user-friendly site.
            </p>
            <br />
            <p>
              Moreover, being a student of SUTD has taught me the{' '}
              <strong>art of design thinking</strong> as well as how to be{' '}
              <strong>creative in implementing solutions</strong>. This unique skill enables
              me to approach projects from both a technical and user-centric perspective.
            </p>
            <br />
            <p>
              As such, I can always compensate for lack of experience with{' '}
              <strong>fast and independent learning</strong> to accomplish various tasks.
            </p>
            <br />
            <p>In my spare time I love playing the guitar and trying various sports!</p>
          </div>
        </div>

        {/* Right — photo + techy meta card */}
        <div className="about-right-col">
          {/* about-pic-row: transparent on desktop (display:contents),
              flex row on mobile so heading + photo sit side-by-side */}
          <div className="about-pic-row">
            {/* Mobile-only rotated heading */}
            <h1 className="about-heading about-heading--mob" aria-hidden="true">About</h1>
            <div className="profile-pic-wrap">
              <SplineErrorBoundary fallback={
                <div className="profile-pic-fallback">
                  <img src={picBorder} className="pic-border" alt="" aria-hidden="true" />
                  <img src={selfPic} className="self-pic" alt="Zachary Lee" />
                </div>
              }>
                <Suspense fallback={<div className="spline-loader"><span className="spline-loader__text">Avatar loading...</span></div>}>
                  <Spline scene="https://prod.spline.design/8sJFCjP6bKNQ1qqB/scene.splinecode" />
                </Suspense>
              </SplineErrorBoundary>
            </div>
          </div>{/* /about-pic-row */}

          <div className="about-meta">
            <div className="meta-item">
              <span className="meta-label">// role</span>
              <span className="meta-value">CS &amp; Design Student</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">// university</span>
              <span className="meta-value">SUTD, Singapore</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">// graduating</span>
              <span className="meta-value">Class of 2027</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">// status</span>
              <span className="meta-value">
                <span className="status-dot" aria-hidden="true" />
                Open to full time roles
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Skills ──────────────────────────── */}
      <section className="skills">
        <p className="section-label">// skills</p>
        <div className="skills-groups">
          {aboutSkills.map((group, i) => (
            <div key={i} className="skills-group">
              <p className="skills-category">{group.category}</p>
              <div className="skills-container">
                {group.skills.map((skill, j) => (
                  <div key={j} className="skillsList">
                    <p>{skill}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA row ─────────────────────────── */}
      <div className="about-bottom">
        <Link className="contactMe" to="/contact">Contact Me</Link>
        <a className="resumeDownload" href={resume} download>Download Resume</a>
      </div>

      {/* ── Back to top ─────────────────────── */}
      <div className="to-top">
        <p onClick={scrollToTop} className="back-to-top-text">back to top</p>
      </div>
    </motion.div>
  );
};

export default About;
