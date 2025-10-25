/**
 * Storage Quota Management System
 * 
 * Manages user storage limits, tracks usage, and provides audit trail
 * Enforces 300MB per-user storage quota
 * 
 * @module lib/storage/quota
 */

import prisma from "@/lib/db/prisma"
import { config } from "@/lib/config"

/**
 * Custom error for storage quota violations
 */
export class StorageQuotaError extends Error {
  constructor(
    message: string,
    public used: number,
    public limit: number,
    public required: number
  ) {
    super(message)
    this.name = "StorageQuotaError"
  }
}

/**
 * Check if user has available storage space
 * 
 * Verifies if user can upload file of given size without exceeding quota
 * 
 * @param userId - User ID to check quota for
 * @param requiredBytes - Number of bytes needed
 * @returns Quota status with usage information
 * @throws Error if user not found
 * 
 * @example
 * ```typescript
 * const check = await checkStorageQuota("user-123", 10485760) // 10MB
 * if (!check.allowed) {
 *   console.log(`Not enough space. Need ${check.required}, available: ${check.available}`)
 * }
 * ```
 */
export async function checkStorageQuota(
  userId: string,
  requiredBytes: number
): Promise<{ allowed: boolean; used: number; limit: number; available: number }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { storageUsed: true, storageLimit: true },
  })

  if (!user) {
    throw new Error("User not found")
  }

  const used = Number(user.storageUsed)
  const limit = Number(user.storageLimit)
  const available = limit - used

  return {
    allowed: available >= requiredBytes,
    used,
    limit,
    available,
  }
}

/**
 * Increment user storage usage
 * 
 * Atomically updates storage usage with quota enforcement
 * Creates audit trail entry
 * Uses transaction for data consistency
 * 
 * @param userId - User ID
 * @param bytes - Number of bytes to add
 * @param metadata - Optional metadata for audit trail
 * @throws StorageQuotaError if quota would be exceeded
 * @throws Error if user not found
 * 
 * @example
 * ```typescript
 * await incrementStorageUsage("user-123", 5242880, {
 *   documentId: "doc-456",
 *   fileName: "presentation.pdf"
 * })
 * ```
 */
export async function incrementStorageUsage(
  userId: string,
  bytes: number,
  metadata?: {
    documentId?: string
    fileName?: string
  }
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // Fetch user with pessimistic lock
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { storageUsed: true, storageLimit: true },
    })

    if (!user) {
      throw new Error("User not found")
    }

    const currentUsed = Number(user.storageUsed)
    const limit = Number(user.storageLimit)
    const newUsed = currentUsed + bytes

    // Enforce quota
    if (newUsed > limit) {
      throw new StorageQuotaError(
        "Storage quota exceeded",
        currentUsed,
        limit,
        bytes
      )
    }

    // Update storage usage
    await tx.user.update({
      where: { id: userId },
      data: { storageUsed: newUsed },
    })

    // Create audit entry
    await tx.storageAudit.create({
      data: {
        userId,
        action: "upload",
        documentId: metadata?.documentId,
        fileName: metadata?.fileName,
        fileSize: BigInt(bytes),
        previousUsage: BigInt(currentUsed),
        newUsage: BigInt(newUsed),
      },
    })
  })
}

/**
 * Decrement user storage usage
 * 
 * Atomically decreases storage usage when files are deleted
 * Creates audit trail entry
 * Never goes below zero
 * 
 * @param userId - User ID
 * @param bytes - Number of bytes to remove
 * @param metadata - Optional metadata for audit trail
 * @throws Error if user not found
 * 
 * @example
 * ```typescript
 * await decrementStorageUsage("user-123", 5242880, {
 *   documentId: "doc-456",
 *   fileName: "old-file.pdf"
 * })
 * ```
 */
export async function decrementStorageUsage(
  userId: string,
  bytes: number,
  metadata?: {
    documentId?: string
    fileName?: string
  }
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { storageUsed: true },
    })

    if (!user) {
      throw new Error("User not found")
    }

    const currentUsed = Number(user.storageUsed)
    const newUsed = Math.max(0, currentUsed - bytes)

    await tx.user.update({
      where: { id: userId },
      data: { storageUsed: newUsed },
    })

    // Create audit entry
    await tx.storageAudit.create({
      data: {
        userId,
        action: "delete",
        documentId: metadata?.documentId,
        fileName: metadata?.fileName,
        fileSize: BigInt(bytes),
        previousUsage: BigInt(currentUsed),
        newUsage: BigInt(newUsed),
      },
    })
  })
}

/**
 * Recalculate user's total storage usage
 * 
 * Sums up all non-deleted documents to get accurate usage
 * Useful for fixing inconsistencies or after bulk operations
 * 
 * @param userId - User ID
 * @returns New calculated storage usage in bytes
 * 
 * @example
 * ```typescript
 * const actualUsage = await recalculateUserStorage("user-123")
 * console.log(`Actual storage usage: ${formatBytes(actualUsage)}`)
 * ```
 */
export async function recalculateUserStorage(userId: string): Promise<number> {
  const totalSize = await prisma.document.aggregate({
    where: {
      userId,
      deletedAt: null,
    },
    _sum: {
      size: true,
    },
  })

  const newUsed = totalSize._sum.size || 0

  await prisma.user.update({
    where: { id: userId },
    data: { storageUsed: newUsed },
  })

  return newUsed
}

/**
 * Get comprehensive storage information for user
 * 
 * Returns usage statistics, document list, and quota status
 * Includes helper flags for UI (isNearLimit, isFull)
 * 
 * @param userId - User ID
 * @returns Complete storage information object
 * @throws Error if user not found
 * 
 * @example
 * ```typescript
 * const info = await getUserStorageInfo("user-123")
 * 
 * if (info.isNearLimit) {
 *   console.warn("Storage almost full!")
 * }
 * 
 * console.log(`Using ${info.usagePercent.toFixed(1)}% of quota`)
 * ```
 */
export async function getUserStorageInfo(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      storageUsed: true,
      storageLimit: true,
      documents: {
        where: { deletedAt: null },
        select: {
          id: true,
          name: true,
          size: true,
          createdAt: true,
        },
        orderBy: { size: "desc" },
      },
    },
  })

  if (!user) {
    throw new Error("User not found")
  }

  const used = Number(user.storageUsed)
  const limit = Number(user.storageLimit)
  const available = limit - used
  const usagePercent = (used / limit) * 100

  return {
    used,
    limit,
    available,
    usagePercent,
    documents: user.documents,
    isNearLimit: usagePercent > 90,
    isFull: usagePercent >= 100,
  }
}

/**
 * Format bytes to human-readable string
 * 
 * Converts byte count to KB, MB, or GB with proper precision
 * 
 * @param bytes - Number of bytes
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string (e.g., "10.5 MB")
 * 
 * @example
 * ```typescript
 * formatBytes(0) // "0 Bytes"
 * formatBytes(1024) // "1 KB"
 * formatBytes(1536) // "1.5 KB"
 * formatBytes(1048576) // "1 MB"
 * formatBytes(10485760, 1) // "10.0 MB"
 * ```
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ["Bytes", "KB", "MB", "GB"]

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}
