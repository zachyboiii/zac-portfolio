import { buildSystemPrompt } from './systemPrompt'

const API_URL = 'https://openrouter.ai/api/v1/chat/completions'

const FREE_MODELS = [
  'openai/gpt-oss-120b:free',
  'openai/gpt-oss-20b:free',
  'google/gemma-2-9b-it:free',
  'meta-llama/llama-3.2-3b-instruct:free',
  'nvidia/nemotron-3-super-120b-a12b:free',
  'nvidia/nemotron-3-nano-30b-a3b:free',
  'poolside/laguna-m.1:free',
  'mistralai/mistral-7b-instruct:free',
]

// Parses an SSE stream and calls onChunk for each content delta.
async function readStream(res, onChunk) {
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed.startsWith('data: ')) continue
      const data = trimmed.slice(6)
      if (data === '[DONE]') return
      try {
        const json = JSON.parse(data)
        const chunk = json.choices?.[0]?.delta?.content
        if (chunk) onChunk(chunk)
      } catch {
        // ignore malformed SSE chunks
      }
    }
  }
}

export async function sendToOpenRouter(conversationHistory, context, onChunk) {
  const key = import.meta.env.VITE_OPENROUTER_API_KEY
  if (!key) throw new Error('Missing VITE_OPENROUTER_API_KEY')

  const systemPrompt = buildSystemPrompt(context)

  const models = import.meta.env.VITE_OPENROUTER_MODEL
    ? [import.meta.env.VITE_OPENROUTER_MODEL]
    : FREE_MODELS

  for (const model of models) {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://zachyboiii.github.io/zac-portfolio',
        'X-Title': 'zac.ai',
      },
      body: JSON.stringify({
        model,
        stream: true,
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory,
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    })

    if (res.status === 404) continue

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`OpenRouter error ${res.status}: ${err}`)
    }

    await readStream(res, onChunk)
    return
  }

  throw new Error('No available models found. Please try again later.')
}
