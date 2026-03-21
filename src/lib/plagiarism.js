export function chunkText(text, chunkSize = 200) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length <= chunkSize) {
      currentChunk += sentence;
    } else {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = sentence;
    }
  }
  if (currentChunk) chunks.push(currentChunk.trim());
  return chunks;
}

export function calculateCosineSimilarity(str1, str2) {
  const words1 = str1.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 2);
  const words2 = str2.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 2);
  
  const set = new Set([...words1, ...words2]);
  const vec1 = [...set].map(w => words1.filter(x => x === w).length);
  const vec2 = [...set].map(w => words2.filter(x => x === w).length);
  
  const dot = vec1.reduce((sum, v, i) => sum + v * vec2[i], 0);
  const mag1 = Math.sqrt(vec1.reduce((sum, v) => sum + v * v, 0));
  const mag2 = Math.sqrt(vec2.reduce((sum, v) => sum + v * v, 0));
  
  if (mag1 === 0 || mag2 === 0) return 0;
  return (dot / (mag1 * mag2)) * 100;
}

export function deduplicateMatches(matches, similarityThreshold = 80) {
  const unique = [];
  for (const match of matches) {
    const isDuplicate = unique.some(u => calculateCosineSimilarity(u.text, match.text) > similarityThreshold);
    if (!isDuplicate) unique.push(match);
  }
  return unique;
}

export function extractKeyPhrases(text, maxLength = 50) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  return sentences
    .map(s => s.trim().substring(0, maxLength))
    .filter(s => s.length > 10);
}
