const RULES = [
  {
    // ── Work Experience ──────────────────────────────────────────────────────
    // Company names + experience-intent words only — no tech terms
    pattern: new RegExp(
      [
        // company names
        'ocbc|edgemaker',
        // role/intern nouns
        'internship|intern(ed)?|\\bta\\b|teaching assistant',
        // experience-intent phrases
        'work experience|work histor|employment|employ|on the job',
        'where.*work|where has.*work|companies.*work|worked at',
        '\\bjob(s)?\\b|\\brole(s)?\\b|\\bposition(s)?\\b',
        'career|professional background|industry experience',
      ].join('|'),
      'i'
    ),
    suggestion: { path: '/work', tab: 'experience', label: 'Work Experience' },
  },
  {
    // ── Projects ────────────────────────────────────────────────────────────
    // Project names + build-intent words only — no tech stack terms
    pattern: new RegExp(
      [
        // direct
        'project(s)?|side project|personal project|school project',
        // exact project names
        'chess ai|the storehouse|hotel ease|truthiego|\\bvroom\\b|glass bridge|kebunfresh|mini arcade|telegram bot',
        // build/create intent
        '\\bbuilt\\b|\\bbuild\\b|what.*made|what.*created|what.*developed|things.*built|stuff.*built',
        // output types (unambiguous)
        'portfolio|hackathon|repo(sitory)?|codebase|demo',
        // discovery
        'show me.*project|list.*project|what project',
      ].join('|'),
      'i'
    ),
    suggestion: { path: '/work', tab: 'projects', label: 'Projects' },
  },
  {
    // ── Contact ─────────────────────────────────────────────────────────────
    pattern: new RegExp(
      [
        'contact|\\bemail\\b|e-mail|reach out|get in touch|message him|drop.*message',
        '\\bhire\\b|hiring|recruit|available.*work|open to work|job offer',
        'how to contact|how do i reach|how can i contact|collab(orate)?|work together',
        'linkedin|lkyzachary',
      ].join('|'),
      'i'
    ),
    suggestion: { path: '/contact', tab: null, label: 'Contact' },
  },
  {
    // ── About ───────────────────────────────────────────────────────────────
    // Personal/educational facts — "about" only when preceding zac/him
    pattern: new RegExp(
      [
        'background|biography|\\bbio\\b|who is|about (zac|zachary|him|himself)',
        'education|studying|\\bstudent\\b|\\bdegree\\b|\\bmajor\\b|graduate|graduation|\\bsutd\\b|university',
        'nationality|singaporean|undergraduate|undergrad',
        'specializ|computer science background|design background',
        'available (for|from)|starting (aug|2027)|full.?time role',
        'skill(s)?|tech stack|what can he do|what does he know|languages.*know|tools.*use',
      ].join('|'),
      'i'
    ),
    suggestion: { path: '/about', tab: null, label: 'About' },
  },
]

export function getPageSuggestion(userMessage) {
  const msg = userMessage.trim()
  for (const { pattern, suggestion } of RULES) {
    if (pattern.test(msg)) return suggestion
  }
  return null
}
