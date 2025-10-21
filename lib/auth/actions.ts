"use server"

import { hash, compare } from "bcryptjs"
import { z } from "zod"
import { createSession, deleteSession } from "./jwt"
import { createUser, getUserByEmail } from "@/lib/db/queries"
import { redirect } from "next/navigation"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export async function login(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const result = loginSchema.safeParse({ email, password })

  if (!result.success) {
    return { error: result.error.errors[0].message }
  }

  const user = await getUserByEmail(email)

  if (!user || !user.password) {
    return { error: "Invalid email or password" }
  }

  const isPasswordValid = await compare(password, user.password)

  if (!isPasswordValid) {
    return { error: "Invalid email or password" }
  }

  await createSession(user.id, user.email, user.name)
  redirect("/dashboard")
}

export async function register(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const result = registerSchema.safeParse({ name, email, password })

  if (!result.success) {
    return { error: result.error.errors[0].message }
  }

  const existingUser = await getUserByEmail(email)

  if (existingUser) {
    return { error: "Email already in use" }
  }

  const hashedPassword = await hash(password, 10)
  const user = await createUser(name, email, hashedPassword)

  await createSession(user.id, user.email, user.name)
  redirect("/dashboard")
}

export async function logout() {
  await deleteSession()
  redirect("/")
}
