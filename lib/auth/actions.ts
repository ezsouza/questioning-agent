"use server"

import { z } from "zod"
import { auth } from "./auth"
import { headers } from "next/headers"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

/**
 * @deprecated Use authClient.signIn.email() from the client instead
 * This function is kept for backward compatibility but should not be used
 * as it causes NEXT_REDIRECT errors when used with try/catch
 */
export async function login(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const result = loginSchema.safeParse({ email, password })

  if (!result.success) {
    return { error: result.error.errors[0].message }
  }

  try {
    const response = await auth.api.signInEmail({
      body: {
        email,
        password,
      },
      headers: await headers(),
    })

    return { success: true, data: response }
  } catch (error: any) {
    return { error: error?.message || "Invalid email or password" }
  }
}

/**
 * @deprecated Use authClient.signUp.email() from the client instead
 * This function is kept for backward compatibility but should not be used
 * as it causes NEXT_REDIRECT errors when used with try/catch
 */
export async function register(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const result = registerSchema.safeParse({ name, email, password })

  if (!result.success) {
    return { error: result.error.errors[0].message }
  }

  try {
    const response = await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
      },
      headers: await headers(),
    })

    return { success: true, data: response }
  } catch (error: any) {
    return { error: error?.message || "Email already in use or registration failed" }
  }
}

/**
 * @deprecated Use authClient.signOut() from the client instead
 * This function is kept for backward compatibility but should not be used
 * as it causes NEXT_REDIRECT errors when used with try/catch
 */
export async function logout() {
  try {
    await auth.api.signOut({
      headers: await headers(),
    })
    return { success: true }
  } catch (error) {
    console.error("Logout error:", error)
    return { error: "Logout failed" }
  }
}
