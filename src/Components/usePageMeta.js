import { useEffect } from 'react'

const DEFAULT_TITLE = 'Zachary Lee — AI Engineer & Software Developer | SUTD'
const DEFAULT_DESCRIPTION =
  'Zachary Lee is an AI Engineer and Computer Science & Design student at SUTD (Singapore), specializing in RAG pipelines, multi-agent LLM systems, and full-stack development.'

// Updates document.title and the meta description per route.
// Restores the defaults on unmount so SPA nav never leaks stale metadata.
export default function usePageMeta(title, description) {
  useEffect(() => {
    const prevTitle = document.title
    document.title = title || DEFAULT_TITLE

    const meta = document.querySelector('meta[name="description"]')
    const prevDescription = meta?.getAttribute('content')
    if (meta) meta.setAttribute('content', description || DEFAULT_DESCRIPTION)

    return () => {
      document.title = prevTitle
      if (meta && prevDescription != null) meta.setAttribute('content', prevDescription)
    }
  }, [title, description])
}
