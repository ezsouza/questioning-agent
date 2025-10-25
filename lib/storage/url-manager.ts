/**
 * Client-side URL Manager for Signed URLs
 * 
 * Handles automatic renewal of signed URLs before they expire
 * Caches URLs and tracks expiration times
 */

interface CachedUrl {
  url: string
  expiresAt: number // Unix timestamp
  key: string
  type: "avatar" | "document"
}

class UrlManager {
  private cache = new Map<string, CachedUrl>()
  private renewalThreshold = 5 * 60 * 1000 // Renew 5 minutes before expiration
  private pendingRequests = new Map<string, Promise<string>>() // Prevent duplicate requests

  /**
   * Get URL for a file, renewing if necessary
   * 
   * @param key - R2 object key
   * @param type - File type (avatar or document)
   * @returns Current valid URL
   */
  async getUrl(key: string, type: "avatar" | "document" = "document"): Promise<string> {
    const cached = this.cache.get(key)
    const now = Date.now()

    // Return cached URL if still valid
    if (cached && cached.expiresAt - now > this.renewalThreshold) {
      return cached.url
    }

    // Check if there's already a pending request for this key
    const pending = this.pendingRequests.get(key)
    if (pending) {
      return pending
    }

    // Renew URL
    const requestPromise = (async () => {
      try {
        const response = await fetch("/api/storage/signed-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key, type }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error("Failed to get signed URL:", response.status, errorData)
          throw new Error(`Failed to get signed URL: ${response.status}`)
        }

        const data = await response.json()
        
        // Cache the new URL
        this.cache.set(key, {
          url: data.url,
          expiresAt: now + data.expiresIn * 1000,
          key,
          type,
        })

        return data.url
      } catch (error) {
        console.error("Error getting signed URL:", error)
        
        // Return cached URL even if expired (fallback)
        if (cached) {
          console.warn("Using expired cached URL as fallback")
          return cached.url
        }
        
        throw error
      } finally {
        // Remove from pending requests
        this.pendingRequests.delete(key)
      }
    })()

    // Store pending request
    this.pendingRequests.set(key, requestPromise)

    return requestPromise
  }

  /**
   * Clear cached URL for a specific key
   */
  clearCache(key: string) {
    this.cache.delete(key)
  }

  /**
   * Clear all cached URLs
   */
  clearAllCache() {
    this.cache.clear()
  }

  /**
   * Check if URL needs renewal
   */
  needsRenewal(key: string): boolean {
    const cached = this.cache.get(key)
    if (!cached) return true
    
    const now = Date.now()
    return cached.expiresAt - now <= this.renewalThreshold
  }
}

// Singleton instance
export const urlManager = new UrlManager()
