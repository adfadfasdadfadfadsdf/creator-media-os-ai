import { Check, WandSparkles } from "lucide-react"
import { Logo } from "@/components/logo"

const benefits = [
  "One workspace for your entire content engine",
  "AI workflows that sound unmistakably like you",
  "Built to move at the speed of your ideas",
]

export function AuthShell({ children, mode }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070914] text-white selection:bg-violet-500/40">
      <div className="noise pointer-events-none absolute inset-0 opacity-[.025]" />
      <div className="pointer-events-none absolute -left-32 -top-36 h-[420px] w-[420px] animate-float rounded-full bg-violet-600/20 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-48 right-[10%] h-[500px] w-[500px] animate-float rounded-full bg-blue-600/15 blur-[120px] [animation-delay:-3s]" />
      <div className="pointer-events-none absolute right-[4%] top-[16%] h-64 w-64 rounded-full bg-fuchsia-500/10 blur-[100px]" />

      <div className="relative mx-auto grid min-h-screen max-w-[1240px] lg:grid-cols-[1.1fr_.9fr]">
        <section className="hidden flex-col justify-between px-12 py-10 lg:flex xl:px-20 xl:py-14">
          <Logo />

          <div className="max-w-[550px] animate-enter">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/[.08] px-3 py-1.5 text-xs font-semibold text-violet-200">
              <WandSparkles className="h-3.5 w-3.5" />
              Your creative command center
            </div>
            <h1 className="font-display text-5xl font-extrabold leading-[1.05] tracking-[-.055em] xl:text-[64px]">
              Create more.
              <br />
              <span className="gradient-text">Grow smarter.</span>
            </h1>
            <p className="mt-6 max-w-[480px] text-[17px] leading-7 text-slate-400">
              Turn scattered ideas into content that compounds. Your audience is
              waiting—let&apos;s build what&apos;s next.
            </p>
            <div className="mt-10 space-y-4">
              {benefits.map((benefit, index) => (
                <div
                  key={benefit}
                  className="flex items-center gap-3 text-sm text-slate-300"
                  style={{ animationDelay: `${180 + index * 90}ms` }}
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/10">
                    <Check className="h-3.5 w-3.5 text-emerald-400" strokeWidth={2.5} />
                  </span>
                  {benefit}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-600">
            <span>© 2026 CreatorOS</span>
            <span className="h-1 w-1 rounded-full bg-slate-700" />
            <span>Privacy first. Always.</span>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-5 py-8 sm:px-8 lg:border-l lg:border-white/[.06]">
          <div className="w-full max-w-[440px]">
            <div className="mb-9 flex justify-center lg:hidden">
              <Logo />
            </div>
            <div className="animate-enter rounded-[24px] border border-white/[.09] bg-white/[.045] p-6 shadow-glow backdrop-blur-2xl sm:p-9">
              <div className="mb-8">
                <p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-violet-400">
                  {mode === "login" ? "Welcome back" : "Start creating"}
                </p>
                <h2 className="font-display text-[30px] font-extrabold tracking-[-.045em] text-white">
                  {mode === "login" ? "Sign in to your account" : "Create your account"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {mode === "login"
                    ? "Your next great idea is right where you left it."
                    : "Join creators building their audience on autopilot."}
                </p>
              </div>
              {children}
            </div>
            <p className="mt-6 text-center text-xs text-slate-600">
              By continuing, you agree to our{" "}
              <a className="text-slate-400 transition hover:text-white" href="#">Terms</a>
              {" "}and{" "}
              <a className="text-slate-400 transition hover:text-white" href="#">Privacy Policy</a>.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
