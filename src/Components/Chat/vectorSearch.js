// Vectors are normalized at embed time, so the dot product alone would equal
// cosine similarity — but we keep the full formula so unnormalized vectors
// still rank correctly.
export function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0
  let normA = 0
  let normB = 0
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i]
    normA += vecA[i] * vecA[i]
    normB += vecB[i] * vecB[i]
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

export function searchKnowledgeBase(queryVector, vectorsData, topK = 4) {
  const scoredChunks = vectorsData.map((item) => ({
    text: item.text,
    score: cosineSimilarity(queryVector, item.vector),
  }))

  scoredChunks.sort((a, b) => b.score - a.score)
  return scoredChunks.slice(0, topK)
}
