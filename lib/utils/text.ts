/**
 * Text utility functions
 */

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).length
}

export function countSentences(text: string): number {
  return text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length
}

export function estimateReadingTime(text: string, wordsPerMinute = 200): number {
  const words = countWords(text)
  return Math.ceil(words / wordsPerMinute)
}

export function cleanText(text: string): string {
  return (
    text
      // Remove multiple spaces
      .replace(/\s+/g, " ")
      // Remove leading/trailing whitespace
      .trim()
      // Remove control characters
      .replace(/[\x00-\x1F\x7F]/g, "")
  )
}
