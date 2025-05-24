import React from 'react';
import '../Work/ProjectDetails.css'
import horiLine from '../../assets/hori-line.svg'
import { useParams, Link } from 'react-router-dom';
import work_data from '../../assets/workdata';
import { motion } from 'framer-motion';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const project = work_data.find(p => p.id === projectId);
  const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
  if (!project) {
    return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Project not found.</motion.div>;
  }

  return (
    <motion.div
      className="pd-page"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5 }}
    >
    
    <div className="pd-top">
        <Link to="/work">back</Link>
        <img src={horiLine} alt="" />
    </div>
    <div className='main-layout'>
      <div className='pd-title'>
          <p>{project.w_title}</p>
      </div>
      
      <div className='pd-container'>
          <img className='pd-img' src={project.w_img} alt="" />
          <h2 className='pd-shortdesc'>{project.short_desc}</h2>
          <p className='pd-tech'>Tech Stack: {project.w_languages.join(', ')}</p>
          
          <div className="pd-link1">
              <p>URL:&nbsp;</p>
              <a href={project.w_link} target="_blank" rel="noopener noreferrer">{project.w_link}</a>
          </div>
          <p className='pd-longdesc'><strong>Description:</strong><pre>{project.long_desc}</pre></p>
          {project.youtube && (
            <div className="pd-video">
              <iframe
                src={project.youtube}
                title="YouTube video player"
                width="742"
                height="415"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          )}
          <a className="pd-link2" href={project.w_link} target="_blank" rel="noopener noreferrer">
              Check it out.
          </a>
          <p onClick={scrollToTop} className="pd-to-top">back to top</p>
      </div>
    </div>
       
    </motion.div>
  );
};

export default ProjectDetail;