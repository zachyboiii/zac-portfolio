import React, { useContext } from 'react';
import '../Work/ProjectDetails.css'
import horiLine from '../../assets/hori-line.svg'
import { useParams, Link } from 'react-router-dom';
import work_data from '../../assets/workdata';
import { motion } from 'framer-motion';
import ScrambleText from '../ScrambleText';
import MobileNav from '../MobileNav/MobileNav';
import { ChatContext } from '../Chat/ChatContext';
import usePageMeta from '../usePageMeta';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const project = work_data.find(p => p.id === projectId);
  const { openZacAI } = useContext(ChatContext);

  usePageMeta(
    project ? `${project.w_title} — Zachary Lee` : 'Project Not Found — Zachary Lee',
    project ? project.short_desc : undefined
  );

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!project) {
    return (
      <motion.div
        className="pd-page"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <nav className="pd-top">
          <Link to="/work" className="pd-back-btn" aria-label="Back to work">
            {/* Desktop: text */}
            <span className="pd-back-text">back</span>
            {/* Mobile: arrow icon */}
            <svg className="pd-back-svg" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 12H5"/><polyline points="12 5 5 12 12 19"/>
            </svg>
          </Link>
          <img src={horiLine} alt="" aria-hidden="true" />
        </nav>
        <p className="pd-not-found">Project not found.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="pd-page"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5 }}
    >
      {/* ── Shared mobile hamburger ─────── */}
      <MobileNav theme="dark" />

      {/* ── Fixed nav ───────────────────── */}
      <nav className="pd-top">
        <Link to="/work" className="pd-back-btn" aria-label="Back to work">
            {/* Desktop: text */}
            <span className="pd-back-text">back</span>
            {/* Mobile: arrow icon */}
            <svg className="pd-back-svg" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 12H5"/><polyline points="12 5 5 12 12 19"/>
            </svg>
          </Link>
        <img src={horiLine} alt="" aria-hidden="true" />
      </nav>

      {/* ── Rotated title (fixed left) ───── */}
      <div className="pd-title">
        <p>{project.w_title}</p>
      </div>

      {/* ── Scrollable content (right) ───── */}
      <div className="pd-content">
        <img className={`pd-img${project.img_small ? ' pd-img--small' : ''}`} src={project.w_img} alt={project.w_title} />

        <h2 className="pd-shortdesc">
          <ScrambleText text={project.short_desc} delay={300} speed={20} />
        </h2>

        {/* ── Stack ───────────────────────── */}
        <div className="pd-meta-group">
          <p className="pd-section-label">// stack</p>
          <div className="pd-tags">
            {project.w_languages.map((lang, i) => (
              <span key={i} className="pd-tag">{lang}</span>
            ))}
          </div>
        </div>

        {/* ── URL ─────────────────────────── */}
        <div className="pd-meta-group">
          <p className="pd-section-label">// url</p>
          <a className="pd-url" href={project.w_link} target="_blank" rel="noopener noreferrer">
            {project.w_link}
          </a>
        </div>

        {/* ── Description ─────────────────── */}
        <div className="pd-meta-group pd-meta-group--desc">
          <p className="pd-section-label">// description</p>
          <pre className="pd-longdesc">{project.long_desc}</pre>
        </div>

        {project.youtube && (
          <div className="pd-video">
            <iframe
              src={project.youtube}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {project.opens_zacai ? (
          // ZacAI lives on the home route; open it via context then navigate
          <Link className="pd-link2" to="/" onClick={openZacAI}>
            Check it out.
          </Link>
        ) : (
          <a
            className="pd-link2"
            href={project.w_link}
            target="_blank"
            rel="noopener noreferrer"
          >
            Check it out.
          </a>
        )}

        <p onClick={scrollToTop} className="pd-to-top">back to top</p>
      </div>
    </motion.div>
  );
};

export default ProjectDetail;
