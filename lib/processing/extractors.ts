import pdfParse from "pdf-parse"
import mammoth from "mammoth"

/**
 * Text extraction utilities for different file types
 */

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer)
    return data.text
  } catch (error) {
    console.error("[PDF_EXTRACTION_ERROR]", error)
    throw new Error("Failed to extract text from PDF")
  }
}

export async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer })
    return result.value
  } catch (error) {
    console.error("[DOCX_EXTRACTION_ERROR]", error)
    throw new Error("Failed to extract text from DOCX")
  }
}

export async function extractTextFromTXT(buffer: Buffer): Promise<string> {
  try {
    return buffer.toString("utf-8")
  } catch (error) {
    console.error("[TXT_EXTRACTION_ERROR]", error)
    throw new Error("Failed to extract text from TXT")
  }
}

export async function extractTextFromMarkdown(buffer: Buffer): Promise<string> {
  try {
    return buffer.toString("utf-8")
  } catch (error) {
    console.error("[MD_EXTRACTION_ERROR]", error)
    throw new Error("Failed to extract text from Markdown")
  }
}

export async function extractText(buffer: Buffer, mimeType: string): Promise<string> {
  switch (mimeType) {
    case "application/pdf":
      return extractTextFromPDF(buffer)
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return extractTextFromDOCX(buffer)
    case "text/plain":
      return extractTextFromTXT(buffer)
    case "text/markdown":
      return extractTextFromMarkdown(buffer)
    default:
      throw new Error(`Unsupported file type: ${mimeType}`)
  }
}
