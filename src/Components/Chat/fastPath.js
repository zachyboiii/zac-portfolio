const RULES = [
  // Greetings
  {
    pattern: /^(hi+|hello+|hey+|yo+|sup|wassup|howdy|hiya|greetings|good (morning|afternoon|evening))[!?.,\s]*$/i,
    reply: "sup!! come come ask me anything about Zac ah: projects, skills, experience, anything also can.",
  },
  // How are you
  {
    pattern: /how (are you|r u|are u|you doing|is it going|'?s it going)/i,
    reply: "bro I'm just a bot lol but I'm here!! wanna know something about Zac?",
  },
  // Thanks
  {
    pattern: /^(thanks?|thank you|thx|ty|cheers|appreciate it|appreciated)[!.,\s]*$/i,
    reply: "np np!! got more questions about Zac anot?",
  },
  // Bye
  {
    pattern: /^(bye+|goodbye|see ya|cya|later|ttyl|take care|farewell|peace)[!.,\s]*$/i,
    reply: "ok bye!! come back if you wanna know more about Zac ya.",
  },
  // Short affirmations
  {
    pattern: /^(ok+|okay|cool|nice|great|awesome|sounds good|got it|i see|interesting|sure|alright)[!.,\s]*$/i,
    reply: "firee!! anything else you wanna know about Zac?",
  },
  // Food / recipes
  {
    pattern: /\b(recipe|cook(ing)?|meal|food|restaurant|cuisine|ingredient|dish)\b/i,
    reply: "bro idk anything about food sia 💀 I only know about Zac... ask me about his projects la.",
  },
  // Weather
  {
    pattern: /\b(weather|forecast|temperature|rain(ing)?|sunny|cloudy|snow(ing)?|humidity)\b/i,
    reply: "check weather app la bro 😭 but fr tho I can tell you a lot about Zac!",
  },
  // Sports
  {
    pattern: /\b(nfl|nba|fifa|mlb|epl|soccer|football|basketball|cricket|tennis|match score|sports?)\b/i,
    reply: "gg wrong bot sia 😭 I only know Zac stuff, his projects and skills and work lor",
  },
  // Finance / crypto
  {
    pattern: /\b(bitcoin|ethereum|crypto|stock market|trading|investment|forex|nft)\b/i,
    reply: "woi u think i some finbro meh 💀 ask me about Zac's projects instead can?",
  },
  // Politics
  {
    pattern: /\b(politic|election|president|democrat|republican|government|congress|senate)\b/i,
    reply: "politics so sian bruh not my thing. ask me about Zac la.",
  },
  // Medical
  {
    pattern: /\b(symptom|diagnos|medical|disease|medication|doctor|treatment|health advice)\b/i,
    reply: "bro please go see a doctor 😭 I cant help with that bruh. but Zac's background I can tell you!",
  },
  // Jokes
  {
    pattern: /\b(tell me a joke|joke|make me laugh|lmao)\b/i,
    reply: "you think I damn funny is it 💀 ask me something about Zac lah that's my whole thing.",
  },
]

export function getFastPathResponse(text) {
  const trimmed = text.trim()
  for (const { pattern, reply } of RULES) {
    if (pattern.test(trimmed)) return reply
  }
  return null
}
