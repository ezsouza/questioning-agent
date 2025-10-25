"use client"

import { useState, useEffect, useCallback } from "react"
import { urlManager } from "@/lib/storage/url-manager"

/**
 * Hook to manage avatar URLs with automatic renewal
 * 
 * Handles both public URLs (no expiration) and signed URLs (auto-renewal)
 * 
 * @param imageUrl - User's image URL from database
 * @param imageKey - R2 key for the image
 * @returns Current valid URL with cache busting
 */
export function useAvatarUrl(imageUrl?: string | null, imageKey?: string | null) {
  const [currentUrl, setCurrentUrl] = useState<string | undefined>(imageUrl || undefined)
  const [isRenewing, setIsRenewing] = useState(false)

  // Check if URL is a public URL (r2.dev domain) or signed URL
  const isPublicUrl = imageUrl?.includes("pub-") && imageUrl.includes(".r2.dev")

  const renewUrl = useCallback(async () => {
    if (!imageKey || isPublicUrl) return

    setIsRenewing(true)
    try {
      const newUrl = await urlManager.getUrl(imageKey, "avatar")
      setCurrentUrl(newUrl)
    } catch (error) {
      console.error("Failed to renew avatar URL:", error)
      // Fallback to original URL if renewal fails
      if (imageUrl) {
        setCurrentUrl(imageUrl)
      }
    } finally {
      setIsRenewing(false)
    }
  }, [imageKey, isPublicUrl, imageUrl])

  // Initial load and periodic renewal
  useEffect(() => {
    // For public URLs, just use them directly with cache busting
    if (isPublicUrl && imageUrl) {
      setCurrentUrl(`${imageUrl}?t=${Date.now()}`)
      return
    }

    // For signed URLs or when we have imageKey, always get fresh URL on mount
    if (imageKey) {
      // Immediately try to get URL (from cache or API)
      renewUrl()

      // Set up periodic renewal (every 20 hours for 24-hour expiration)
      const renewalInterval = setInterval(() => {
        renewUrl()
      }, 20 * 60 * 60 * 1000) // 20 hours

      return () => clearInterval(renewalInterval)
    } else if (imageUrl) {
      // Fallback: just use the URL as-is if no imageKey
      setCurrentUrl(imageUrl)
    }
  }, [imageKey, isPublicUrl, renewUrl, imageUrl])

  return {
    url: currentUrl,
    isRenewing,
    renewUrl,
  }
}
