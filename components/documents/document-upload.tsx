"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileText, X, Loader2 } from "lucide-react"
import { SUPPORTED_FILE_TYPES, MAX_FILE_SIZE } from "@/lib/constants"

export function DocumentUpload() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

    setError(null)

    // Validate file type
    const fileType = selectedFile.type
    const isValidType = Object.keys(SUPPORTED_FILE_TYPES).includes(fileType)

    if (!isValidType) {
      setError("Invalid file type. Please upload PDF, DOCX, TXT, or Markdown files.")
      return
    }

    // Validate file size
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("File size exceeds 10MB limit.")
      return
    }

    setFile(selectedFile)
  }, [])

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      const droppedFile = event.dataTransfer.files[0]
      if (!droppedFile) return

      // Create a synthetic event to reuse validation logic
      const syntheticEvent = {
        target: { files: [droppedFile] },
      } as React.ChangeEvent<HTMLInputElement>

      handleFileChange(syntheticEvent)
    },
    [handleFileChange],
  )

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }, [])

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    setError(null)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Upload failed")
      }

      const result = await response.json()

      // Simulate progress for better UX
      setUploadProgress(100)

      // Refresh the page to show the new document
      router.refresh()

      // Reset form
      setFile(null)
      setUploadProgress(0)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = () => {
    setFile(null)
    setError(null)
    setUploadProgress(0)
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!file ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer"
        >
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".pdf,.docx,.txt,.md"
            onChange={handleFileChange}
            disabled={isUploading}
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">Drop your file here or click to browse</p>
            <p className="text-sm text-muted-foreground">Supports PDF, DOCX, TXT, and Markdown (max 10MB)</p>
          </label>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 border rounded-lg">
            <FileText className="h-8 w-8 text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{file.name}</p>
              <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            {!isUploading && (
              <Button variant="ghost" size="icon" onClick={handleRemove}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {isUploading && uploadProgress > 0 && (
            <div className="space-y-2">
              <Progress value={uploadProgress} />
              <p className="text-sm text-muted-foreground text-center">{uploadProgress}% uploaded</p>
            </div>
          )}

          <Button onClick={handleUpload} disabled={isUploading} className="w-full">
            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isUploading ? "Uploading..." : "Upload Document"}
          </Button>
        </div>
      )}
    </div>
  )
}
