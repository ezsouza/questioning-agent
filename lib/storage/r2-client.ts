/**
 * Cloudflare R2 Storage Client
 * 
 * Provides a complete interface for interacting with Cloudflare R2 object storage
 * using the AWS SDK v3 S3-compatible API.
 * 
 * @see https://developers.cloudflare.com/r2/
 */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  type PutObjectCommandInput,
} from "@aws-sdk/client-s3"
import { Upload } from "@aws-sdk/lib-storage"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { config } from "@/lib/config"
import crypto from "crypto"

const r2Config = config.storage.r2

/**
 * Initialize S3 Client configured for Cloudflare R2
 * 
 * Uses S3-compatible API with R2-specific endpoint
 */
export const r2Client = new S3Client({
  region: r2Config.region,
  endpoint: r2Config.endpoint,
  credentials: {
    accessKeyId: r2Config.accessKeyId,
    secretAccessKey: r2Config.secretAccessKey,
  },
})

export interface UploadOptions {
  fileName: string
  fileType: string
  fileSize: number
  userId: string
  folder?: "documents" | "avatars" | "temp"
  metadata?: Record<string, string>
}

export interface UploadResult {
  key: string
  url: string
  bucket: string
  size: number
  checksum: string
  contentType: string
}

/**
 * Upload file to Cloudflare R2
 * 
 * Supports both File objects (browser) and Buffer (Node.js)
 * Uses multipart upload for files larger than 5MB
 * Generates unique keys with timestamp and random suffix
 * 
 * @param file - File or Buffer to upload
 * @param options - Upload configuration
 * @returns Upload result with key, URL, and metadata
 * 
 * @example
 * ```typescript
 * const result = await uploadToR2(file, {
 *   fileName: "document.pdf",
 *   fileType: "application/pdf",
 *   fileSize: file.size,
 *   userId: "user-123",
 *   folder: "documents"
 * })
 * ```
 */
export async function uploadToR2(
  file: File | Buffer,
  options: UploadOptions
): Promise<UploadResult> {
  const { fileName, fileType, fileSize, userId, folder = "documents", metadata = {} } = options

  // Generate unique key with folder structure
  const timestamp = Date.now()
  const randomSuffix = crypto.randomBytes(8).toString("hex")
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_")
  const key = `${folder}/${userId}/${timestamp}-${randomSuffix}-${sanitizedFileName}`

  // Convert File to Buffer if needed
  let buffer: Buffer
  if (Buffer.isBuffer(file)) {
    buffer = file
  } else {
    const arrayBuffer = await (file as File).arrayBuffer()
    buffer = Buffer.from(arrayBuffer)
  }

  // Calculate MD5 checksum for data integrity
  const checksum = crypto.createHash("md5").update(buffer).digest("hex")

  // Use multipart upload for better reliability with large files
  const upload = new Upload({
    client: r2Client,
    params: {
      Bucket: r2Config.bucketName,
      Key: key,
      Body: buffer,
      ContentType: fileType,
      ContentLength: fileSize,
      Metadata: {
        userId,
        originalName: fileName,
        uploadedAt: new Date().toISOString(),
        checksum, // Store checksum in metadata instead
        ...metadata,
      },
    },
  })

  await upload.done()

  // Generate public URL if configured, otherwise use signed URL with short expiration
  // For signed URLs, we return the public URL structure and let getSignedDownloadUrl handle expiration
  let url: string
  if (r2Config.publicUrl && r2Config.publicUrl.trim() !== "") {
    url = `${r2Config.publicUrl}/${key}`
  } else {
    // Signed URL should be generated on-demand
    // This is for immediate display after upload (1 hour expiration)
    url = await getSignedUrl(
      r2Client,
      new GetObjectCommand({
        Bucket: r2Config.bucketName,
        Key: key,
      }),
      { expiresIn: 3600 } // 1 hour for immediate display
    )
  }

  return {
    key,
    url,
    bucket: r2Config.bucketName,
    size: fileSize,
    checksum,
    contentType: fileType,
  }
}

/**
 * Download file from Cloudflare R2
 * 
 * Retrieves object and returns as Buffer
 * Handles streaming response properly
 * 
 * @param key - R2 object key
 * @returns File content as Buffer
 * 
 * @example
 * ```typescript
 * const fileBuffer = await downloadFromR2("documents/user-123/file.pdf")
 * ```
 */
export async function downloadFromR2(key: string): Promise<Buffer> {
  const command = new GetObjectCommand({
    Bucket: r2Config.bucketName,
    Key: key,
  })

  const response = await r2Client.send(command)
  
  if (!response.Body) {
    throw new Error("No body in R2 response")
  }

  // Handle ReadableStream properly
  const stream = response.Body as ReadableStream
  const chunks: Uint8Array[] = []

  const reader = stream.getReader()
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
  }

  return Buffer.concat(chunks)
}

/**
 * Delete file from Cloudflare R2
 * 
 * Permanently removes object from storage
 * Use with caution - operation is irreversible
 * 
 * @param key - R2 object key to delete
 * 
 * @example
 * ```typescript
 * await deleteFromR2("documents/user-123/old-file.pdf")
 * ```
 */
export async function deleteFromR2(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: r2Config.bucketName,
    Key: key,
  })

  await r2Client.send(command)
}

/**
 * Check if file exists in R2
 * 
 * Uses HEAD request for efficiency (no body download)
 * 
 * @param key - R2 object key
 * @returns True if file exists, false otherwise
 * 
 * @example
 * ```typescript
 * if (await fileExistsInR2("documents/user-123/file.pdf")) {
 *   console.log("File exists")
 * }
 * ```
 */
export async function fileExistsInR2(key: string): Promise<boolean> {
  try {
    const command = new HeadObjectCommand({
      Bucket: r2Config.bucketName,
      Key: key,
    })
    await r2Client.send(command)
    return true
  } catch {
    return false
  }
}

/**
 * Get file metadata from R2
 * 
 * Retrieves object information without downloading content
 * 
 * @param key - R2 object key
 * @returns Object metadata (size, content type, last modified, custom metadata)
 * 
 * @example
 * ```typescript
 * const metadata = await getFileMetadata("documents/user-123/file.pdf")
 * console.log(`File size: ${metadata.size} bytes`)
 * ```
 */
export async function getFileMetadata(key: string) {
  const command = new HeadObjectCommand({
    Bucket: r2Config.bucketName,
    Key: key,
  })

  const response = await r2Client.send(command)
  return {
    size: response.ContentLength || 0,
    contentType: response.ContentType || "",
    lastModified: response.LastModified,
    metadata: response.Metadata || {},
  }
}

/**
 * List all files for a user
 * 
 * Supports filtering by folder
 * Returns array of S3 objects
 * 
 * @param userId - User ID to filter files
 * @param folder - Optional folder to search within
 * @returns Array of S3 objects
 * 
 * @example
 * ```typescript
 * const files = await listUserFiles("user-123", "documents")
 * files.forEach(file => console.log(file.Key))
 * ```
 */
export async function listUserFiles(userId: string, folder?: string) {
  const prefix = folder ? `${folder}/${userId}/` : `${userId}/`

  const command = new ListObjectsV2Command({
    Bucket: r2Config.bucketName,
    Prefix: prefix,
  })

  const response = await r2Client.send(command)
  return response.Contents || []
}

/**
 * Generate temporary signed URL for secure downloads
 * 
 * Creates time-limited access URL without exposing credentials
 * Uses appropriate expiration times based on use case:
 * - Avatars: 24 hours (frequently accessed, need reasonable cache)
 * - Documents: 1 hour (sensitive content, shorter expiration)
 * - Temporary shares: Custom duration
 * 
 * @param key - R2 object key
 * @param expiresIn - URL expiration time in seconds (default: 1 hour)
 * @returns Signed URL string
 * 
 * @example
 * ```typescript
 * // Generate URL valid for 15 minutes (900 seconds)
 * const url = await getSignedDownloadUrl("documents/user-123/file.pdf", 900)
 * 
 * // Generate URL for avatar (24 hours)
 * const avatarUrl = await getSignedDownloadUrl("avatars/user-123/photo.jpg", 86400)
 * ```
 */
export async function getSignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
  // Enforce maximum expiration of 7 days for security
  const MAX_EXPIRATION = 7 * 24 * 3600 // 7 days
  const safeExpiresIn = Math.min(expiresIn, MAX_EXPIRATION)

  const command = new GetObjectCommand({
    Bucket: r2Config.bucketName,
    Key: key,
  })

  return getSignedUrl(r2Client, command, { expiresIn: safeExpiresIn })
}

/**
 * Generate public URL or signed URL based on configuration
 * 
 * If R2_PUBLIC_URL is configured, returns public URL (no expiration)
 * Otherwise, generates signed URL with appropriate expiration
 * 
 * @param key - R2 object key
 * @param expiresIn - URL expiration time in seconds (only for signed URLs)
 * @returns URL string
 * 
 * @example
 * ```typescript
 * // Get URL for avatar (24 hours if signed)
 * const url = await getFileUrl("avatars/user-123/photo.jpg", 86400)
 * ```
 */
export async function getFileUrl(key: string, expiresIn = 3600): Promise<string> {
  if (r2Config.publicUrl && r2Config.publicUrl.trim() !== "") {
    return `${r2Config.publicUrl}/${key}`
  }
  return getSignedDownloadUrl(key, expiresIn)
}
