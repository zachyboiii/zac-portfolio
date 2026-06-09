/**
 * Experience data — add/remove entries here whenever.
 *
 * Fields:
 *   id          — unique slug (used as React key)
 *   e_company   — company / organisation name (displayed large)
 *   e_role      — job title / position
 *   e_type      — label shown above name: "Internship" | "Part-time" | "Full-time" | etc.
 *   e_date      — date range, keep short e.g. "May 25 – Aug 25"
 *   e_desc      — one-line description of what you did
 *   e_skills    — array of tech / skills used (rendered as pill tags)
 *   e_link      — company website or LinkedIn URL; use "" to render name as plain text
 *   e_current   — true if you are currently in this role (timeline dot turns green + pulses)
 */

// Keep entries in reverse-chronological order — newest at top, oldest at bottom.
const experience_data = [
  {
    id: "ocbc",
    e_company: "OCBC Bank",
    e_role: "AI Engineer",
    e_type: "Internship",
    e_date: "May 2026 – Present",
    e_desc: "Built a chatbot with agentic workflows using RAG and LangGraph to assist with customer portfolio management.",
    e_skills: ["RAG", "LangGraph", "Agentic AI","Vector DB", "FastAPI", "PostgreSQL", "Git"],
    e_link: "",
    e_current: true,
  },
  {
    id: "edgemaker",
    e_company: "Edgemaker.ai",
    e_role: "Fullstack and AI Intern",
    e_type: "Internship",
    e_date: "Jan 2026 – May 2026",
    e_desc: "Developed AI agents to expand the product's capabilities, alongside full-stack fixes and features.",
    e_skills: ["Next.js", "Node.js", "Springboot", "Agentic AI", "Prompt Engineering", "Git"],
    e_link: "",
    e_current: false,
  },
  {
    id: "teaching-assistant",
    e_company: "SUTD",
    e_role: "Teaching Assistant",
    e_type: "Part-time",
    e_date: "May 2025 – Aug 2025",
    e_desc: "Assisted in teaching programming concepts and provided guidance to students in lab sessions.",
    e_skills: ["Python", "Pandas", "Jupyter Notebooks", "Git"],
    e_link: "",
    e_current: false,
  },
]

export default experience_data
