"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { loginSchema, registerSchema } from "@/lib/validations"

function Field({ label, error, icon: Icon, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[13px] font-semibold text-slate-300">{label}</span>
      <span className="relative block">
        <Icon className="pointer-events-none absolute left-3.5 top-3.5 h-[18px] w-[18px] text-slate-500" />
        {children}
      </span>
      <span className="mt-1.5 block min-h-[18px] text-xs text-rose-400">{error || ""}</span>
    </label>
  )
}

export function AuthForm({ mode }) {
  const isLogin = mode === "login"
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const schema = isLogin ? loginSchema : registerSchema
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) })

  async function onSubmit(values) {
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || "Something went wrong")

      toast.success(isLogin ? "Welcome back!" : "Your account is ready!", {
        description: isLogin
          ? "Taking you to your workspace."
          : "Welcome to CreatorOS. Let’s make something great.",
      })
      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      toast.error(isLogin ? "Couldn’t sign you in" : "Couldn’t create your account", {
        description: error.message,
      })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {!isLogin && (
        <Field label="Full name" error={errors.name?.message} icon={UserRound}>
          <Input
            {...register("name")}
            error={errors.name}
            className="pl-11"
            placeholder="Alex Morgan"
            autoComplete="name"
          />
        </Field>
      )}

      <Field label="Email address" error={errors.email?.message} icon={Mail}>
        <Input
          {...register("email")}
          error={errors.email}
          className="pl-11"
          type="email"
          placeholder="you@company.com"
          autoComplete="email"
        />
      </Field>

      <Field label="Password" error={errors.password?.message} icon={LockKeyhole}>
        <Input
          {...register("password")}
          error={errors.password}
          className="px-11"
          type={showPassword ? "text" : "password"}
          placeholder={isLogin ? "Enter your password" : "At least 8 characters"}
          autoComplete={isLogin ? "current-password" : "new-password"}
        />
        <button
          type="button"
          onClick={() => setShowPassword((value) => !value)}
          className="absolute right-3.5 top-3.5 text-slate-500 transition hover:text-slate-200"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
        </button>
      </Field>

      {isLogin && (
        <div className="-mt-1 mb-5 flex items-center justify-between text-xs">
          <label className="flex cursor-pointer items-center gap-2 text-slate-400">
            <input type="checkbox" className="h-3.5 w-3.5 rounded border-white/10 accent-violet-500" />
            Remember me
          </label>
          <button type="button" onClick={() => toast.info("Password reset flow is coming next.")} className="font-semibold text-violet-400 transition hover:text-violet-300">
            Forgot password?
          </button>
        </div>
      )}

      <Button type="submit" loading={isSubmitting}>
        {isLogin ? "Sign in to CreatorOS" : "Create free account"}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Button>

      <p className="mt-6 text-center text-sm text-slate-400">
        {isLogin ? "New to CreatorOS?" : "Already have an account?"}{" "}
        <Link
          href={isLogin ? "/register" : "/login"}
          className="font-bold text-white underline decoration-white/20 underline-offset-4 transition hover:text-violet-300 hover:decoration-violet-400"
        >
          {isLogin ? "Create an account" : "Sign in"}
        </Link>
      </p>
    </form>
  )
}
