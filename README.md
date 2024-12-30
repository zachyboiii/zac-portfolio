#  Zachary's Portfolio Website

This is my personal website showcasing my work as a computer science student. It includes sections like About, Work, and Contact to give visitors a comprehensive view of my skills and experience.

## Features
- **Responsive design**: Works on mobile, tablet, and desktop.
- **Smooth animations**: Uses Framer Motion for page transitions.
- **Downloadable resume**: Visitors can download my resume.

## Technologies Used
- **React**: For building the frontend.
- **React Router**: For navigation between pages.
- **Framer Motion**: For page animations and transitions.
- **CSS**: For styling the website.
- **GitHub Pages**: For deploying the website.

## The Structure of the website is as follows:
### App.jsx

```JSX
const App = () => {
  
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}

export default App
```

### AnimatedRoutes.jsx

```JSX
function AnimatedRoutes() {
  const location = useLocation();
  return (
    
      <AnimatePresence>
        <Routes location ={location} key ={location.pathname}>
          <Route path="/" element={<Hero />} />
          <Route path="/work" element={<Work />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </AnimatePresence>
    
  );
}

export default AnimatedRoutes
```

## Deployment

This website is hosted on GitHub Pages. You can view the live version at:  
[https://zachyboiii.github.io/zac-portfolio/](https://zachyboiii.github.io/zac-portfolio/)

## Usage

This portfolio website has the following main sections:

- **Home (Hero)**: The landing page that introduces who I am with a short summary and animations.
- **About**: A section that provides detailed information about my background and skills.
- **Work**: A showcase of my projects and work experience.
- **Contact**: A page where visitors can reach out to me directly, be it through linkedin, github or email.

To navigate the website, simply click on the links in the main menu. Each page is designed to be fully responsive and looks great on mobile, tablet, and desktop devices.

- **Back to Top Button**: The "Back to Top" button, located at the bottom of some pages, allows users to quickly scroll back to the top of the page.

## Contact Information

If you'd like to get in touch with me, here are the best ways to reach me:

- **Email**: [lkyzachary@gmail.com](mailto:lkyzachary@gmail.com) or [zachary_lee@mymail.sutd.edu.sg](mailto:zachary_lee@mymail.sutd.edu.sg)
- **GitHub**: [https://github.com/zachyboiii](https://github.com/zachyboiii)
- **LinkedIn**: [https://www.linkedin.com/in/zachary-lee-ky/](https://www.linkedin.com/in/zachary-lee-ky/)

Feel free to send me a message for collaborations, inquiries, or general questions about my work. I'm always open to new opportunities and feedback!
