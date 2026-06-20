import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().trim().email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Use at least 8 characters")
    .regex(/[A-Z]/, "Add one uppercase letter")
    .regex(/[0-9]/, "Add one number"),
})
