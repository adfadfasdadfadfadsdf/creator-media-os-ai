import { AuthForm } from "@/components/auth-form"
import { AuthShell } from "@/components/auth-shell"

export const metadata = { title: "Create account — CreatorOS" }

export default function RegisterPage() {
  return (
    <AuthShell mode="register">
      <AuthForm mode="register" />
    </AuthShell>
  )
}
