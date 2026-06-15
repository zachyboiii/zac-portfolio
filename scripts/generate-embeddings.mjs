// Build-time embedding pipeline.
//
// Derives the knowledge base from the real data sources:
//   - src/assets/tex_resume.tex       (resume — same content as resume.pdf)
//   - src/assets/workdata.js          (projects)
//   - src/assets/experienceData.js    (work experience)
//   - src/assets/aboutdata.js         (skills)
//   - src/assets/sutd_transcript.pdf  (coursework — hardcoded in EXTRA_CHUNKS below)
//   - EXTRA_CHUNKS below              (facts not in any data file)
//
// Embeds every chunk with the same model the browser uses
// (Xenova/all-MiniLM-L6-v2) and writes:
//   - public/vectors.json                  (vector DB fetched at runtime)
//   - src/Components/Chat/knowledge.js     (plain-text fallback, auto-generated)
//
// Run after every data update: npm run embed

import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { createServer } from 'vite'
import { pipeline } from '@xenova/transformers'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

// Facts that live in no data file — edit freely.
const EXTRA_CHUNKS = [
  `About Zachary Lee: Computer Science and Design student at SUTD (Singapore University of Technology and Design), specializing in Artificial Intelligence and Software Engineering. Expected graduation 2027. Based in Singapore and open to full-time roles in AI and software engineering starting Aug 2027.`,
  `Contact Zachary: Work email lkyzachary@gmail.com. School email zachary_lee@mymail.sutd.edu.sg. LinkedIn: https://www.linkedin.com/in/zachary-lee-ky/`,

  // Derived from sutd_transcript.pdf (updated 15 Jun 2026)
  `SUTD Coursework (Singapore University of Technology and Design, B.Eng. Computer Science and Design, Cumulative GPA 4.65/5.0, Honours with Highest Distinction):
2023 Sep–Dec: Computational Thinking For Design, Modelling and Analysis, Physical World, Social Science: Understanding Behaviour, Culture & Society.
2024 Jan–Apr: Design Thinking and Innovation, Modeling Space and Systems (A), Science for a Sustainable World (A-), Technological World (A).
2024 Sep–Dec: Data Driven World (A), Modelling Uncertainty (A-), Designing Energy Systems (B+), Global Humanities: Literature, Philosophy, and Ethics.
2025 Jan–Apr: Introduction to Information Systems & Programming (A), Computation Structures (A), Algorithms (A) — Term GPA 5.00.
2025 May–Aug: Elements of Software Construction (A-), Computer System Engineering (A-), Database Systems (B+), Organisational Processes (A-).
2025 Sep–Dec (credits transferred from University of Waterloo exchange): User Interface Design & Implementation, Machine Learning, Artificial Intelligence.
Awards: SUTD Honours List for Sophomore & Junior Terms (Trimester 2, AY 2025).`,
]

/* ── LaTeX resume parsing ─────────────────────────────────────────── */

// Returns [content, indexAfterClosingBrace] for the brace group at src[start]
function readBraced(src, start) {
  let depth = 0
  for (let i = start; i < src.length; i++) {
    if (src[i] === '{') depth++
    else if (src[i] === '}') {
      depth--
      if (depth === 0) return [src.slice(start + 1, i), i + 1]
    }
  }
  throw new Error('Unbalanced braces in LaTeX source')
}

// Reads n consecutive {...} arguments starting at idx
function readArgs(src, idx, n) {
  const args = []
  let i = idx
  for (let k = 0; k < n; k++) {
    while (i < src.length && src[i] !== '{') i++
    const [arg, next] = readBraced(src, i)
    args.push(arg)
    i = next
  }
  return [args, i]
}

function cleanLatex(s) {
  let out = s
    // Environments and spacing commands carry no text — drop them entirely
    .replace(/\\(begin|end)\{[^{}]*\}(\[[^\]]*\])?/g, ' ')
    .replace(/\\[hv]space\*?\{[^{}]*\}/g, ' ')
  // Unwrap formatting commands (loop handles nesting like \textbf{\href{..}{..}})
  for (let prev = null; prev !== out; ) {
    prev = out
    out = out
      .replace(/\\href\{[^{}]*\}\{([^{}]*)\}/g, '$1')
      .replace(/\\[a-zA-Z]+\{([^{}]*)\}/g, '$1')
  }
  return out
    .replace(/\$\|\$/g, '|')
    .replace(/\\([&%_$#])/g, '$1')
    .replace(/\\\\/g, ' ')
    .replace(/(?<![\\-])---?(?!-)/g, '–')
    .replace(/\\[a-zA-Z]+\*?(\[[^\]]*\])?/g, '')
    .replace(/\\ /g, ' ')
    .replace(/[{}~]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function parseResume(tex) {
  // Strip comment lines (resume source only uses full-line % comments)
  const src = tex
    .split('\n')
    .filter((line) => !line.trim().startsWith('%'))
    .join('\n')

  const chunks = []

  // Header + summary: the two \begin{center} blocks before the first section
  const centers = [...src.matchAll(/\\begin\{center\}([\s\S]*?)\\end\{center\}/g)]
  if (centers[0]) chunks.push(`Resume — Contact: ${cleanLatex(centers[0][1])}`)
  if (centers[1]) chunks.push(`Resume — Summary: ${cleanLatex(centers[1][1])}`)

  // Split body into sections
  const sectionMatches = [...src.matchAll(/\\section\{/g)]
  for (let s = 0; s < sectionMatches.length; s++) {
    const nameStart = sectionMatches[s].index + sectionMatches[s][0].length - 1
    const [rawName, bodyStart] = readBraced(src, nameStart)
    const sectionName = cleanLatex(rawName)
    const bodyEnd = s + 1 < sectionMatches.length ? sectionMatches[s + 1].index : src.length
    const body = src.slice(bodyStart, bodyEnd)

    // Entry-less sections (e.g. Technical Skills) become a single chunk
    const macroRe = /\\(resumeSubheading|resumeProjectHeading|resumeItem)\b/g
    const macros = [...body.matchAll(macroRe)]
    if (macros.length === 0) {
      chunks.push(`Resume — ${sectionName}: ${cleanLatex(body)}`)
      continue
    }

    // Group each (sub)heading with the \resumeItem bullets that follow it
    let current = null
    const flush = () => {
      if (!current) return
      chunks.push(`Resume — ${sectionName}: ${current.head} ${current.items.join(' ')}`.trim())
      current = null
    }
    for (const m of macros) {
      const argStart = m.index + m[0].length
      if (m[1] === 'resumeSubheading') {
        flush()
        const [[title, date, role, place]] = readArgs(body, argStart, 4)
        current = {
          head: cleanLatex(`${title} — ${role} (${date}${place ? `, ${place}` : ''}).`),
          items: [],
        }
      } else if (m[1] === 'resumeProjectHeading') {
        flush()
        const [[title, date]] = readArgs(body, argStart, 2)
        current = { head: cleanLatex(`${title} (${date}).`), items: [] }
      } else {
        const [[item]] = readArgs(body, argStart, 1)
        const text = cleanLatex(item)
        if (current) current.items.push(text)
        else chunks.push(`Resume — ${sectionName}: ${text}`)
      }
    }
    flush()
  }

  return chunks
}

/* ── Site data chunks ─────────────────────────────────────────────── */

// workdata/aboutdata/experienceData import images, which plain Node can't
// resolve — load them through Vite's SSR pipeline instead.
async function loadSiteData() {
  const vite = await createServer({
    root,
    logLevel: 'error',
    server: { middlewareMode: true },
    appType: 'custom',
    // SSR module loading doesn't need the browser dep optimizer; disabling it
    // stops the background dep-scan from erroring when we close the server
    optimizeDeps: { noDiscovery: true, include: [] },
  })
  try {
    const work = (await vite.ssrLoadModule('/src/assets/workdata.js')).default
    const experience = (await vite.ssrLoadModule('/src/assets/experienceData.js')).default
    const aboutSkills = (await vite.ssrLoadModule('/src/assets/aboutdata.js')).default
    return { work, experience, aboutSkills }
  } finally {
    await vite.close()
  }
}

function buildSiteChunks({ work, experience, aboutSkills }) {
  const chunks = []

  for (const e of experience) {
    chunks.push(
      `Work Experience: ${e.e_company} — ${e.e_role} (${e.e_type}, ${e.e_date}${e.e_current ? ', current role' : ''}). ${e.e_desc} Skills: ${e_skillsList(e)}.`,
    )
  }

  for (const p of work) {
    const desc = p.long_desc.replace(/\s+/g, ' ').trim()
    chunks.push(
      `Project: ${p.w_title} (${p.w_date}) — ${p.short_desc} ${desc} Stack: ${p.w_languages.join(', ')}. Link: ${p.w_link}`,
    )
  }

  chunks.push(
    `Skills: ${aboutSkills.map((c) => `${c.category}: ${c.skills.join(', ')}`).join('. ')}.`,
  )

  return chunks
}

const e_skillsList = (e) => e.e_skills.join(', ')

/* ── Main ─────────────────────────────────────────────────────────── */

const tex = await readFile(path.join(root, 'src/assets/tex_resume.tex'), 'utf8')
const siteData = await loadSiteData()

const chunks = [
  ...EXTRA_CHUNKS,
  ...buildSiteChunks(siteData),
  ...parseResume(tex),
]

console.log(`Embedding ${chunks.length} chunks...`)
const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2')

const db = []
for (const text of chunks) {
  const output = await embedder(text, { pooling: 'mean', normalize: true })
  db.push({ text, vector: Array.from(output.data) })
}

await writeFile(path.join(root, 'public/vectors.json'), JSON.stringify(db))
console.log(`Exported ${db.length} vectors to public/vectors.json`)

// Regenerate the plain-text fallback used when the RAG pipeline can't load
const knowledgeFile = `// AUTO-GENERATED by scripts/generate-embeddings.mjs — do not edit by hand.
// Sources: tex_resume.tex, workdata.js, experienceData.js, aboutdata.js.
// Used as the runtime fallback when the RAG pipeline fails to load.
// Regenerate with: npm run embed

export const KNOWLEDGE_CHUNKS = ${JSON.stringify(chunks, null, 2)}
`
await writeFile(path.join(root, 'src/Components/Chat/knowledge.js'), knowledgeFile)
console.log('Regenerated src/Components/Chat/knowledge.js (runtime fallback)')
