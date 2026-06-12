import { searchKnowledgeBase } from './vectorSearch'
import { KNOWLEDGE_CHUNKS } from './knowledge'

// Lazy singletons — the embedding model (~25MB, cached by the browser after
// first download) and the prebuilt vector DB are only loaded once.
let initPromise = null

async function init() {
  if (!initPromise) {
    initPromise = (async () => {
      const [{ pipeline }, vectorsRes] = await Promise.all([
        import('@xenova/transformers'),
        fetch(`${import.meta.env.BASE_URL}vectors.json`),
      ])
      if (!vectorsRes.ok) throw new Error(`Failed to fetch vectors.json: ${vectorsRes.status}`)
      const vectors = await vectorsRes.json()
      const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2')
      return { embedder, vectors }
    })()
    // Allow a retry on the next message if init fails (e.g. flaky network)
    initPromise.catch(() => { initPromise = null })
  }
  return initPromise
}

// Kick off model + vector loading early (e.g. when the chat UI opens) so the
// first message doesn't pay the full startup cost.
export function preloadRAG() {
  init().catch(() => {})
}

// Returns the topK most relevant knowledge chunks for the query, joined as a
// context block. Falls back to the full knowledge base if the RAG pipeline is
// unavailable, so the chatbot degrades gracefully instead of breaking.
export async function retrieveContext(query, topK = 4) {
  try {
    const { embedder, vectors } = await init()
    const output = await embedder(query, { pooling: 'mean', normalize: true })
    const queryVector = Array.from(output.data)
    const chunks = searchKnowledgeBase(queryVector, vectors, topK)
    return chunks.map((c) => c.text).join('\n\n')
  } catch (err) {
    console.error('RAG retrieval failed, falling back to full knowledge base', err)
    return KNOWLEDGE_CHUNKS.join('\n\n')
  }
}
