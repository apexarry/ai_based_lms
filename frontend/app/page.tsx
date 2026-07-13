import type { Metadata } from 'next'
import { LoginForm } from '@/components/auth/login-form'
import { Brand } from '@/components/brand'
import { ShieldCheck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Sign In · DESIDOC AI Knowledge Library',
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen bg-background">
      {/* Left: form */}
      <div className="flex w-full flex-col px-6 py-8 lg:w-[46%] lg:px-14">
        <Brand size="md" />

        <div className="flex flex-1 flex-col justify-center py-10">
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-8 space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                <ShieldCheck className="size-3.5 text-success" />
                Secure DRDO Access
              </span>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Welcome back
              </h1>
              <p className="text-sm text-muted-foreground">
                Sign in to access the DESIDOC AI Knowledge Library.
              </p>
            </div>

            <LoginForm />

            <p className="mt-8 text-center text-xs text-muted-foreground">
              Authorised personnel only. All activity is monitored and logged in
              accordance with DRDO security policy.
            </p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} DESIDOC, Defence Research &amp; Development
          Organisation.
        </p>
      </div>

      {/* Right: illustration */}
      <div
        className="relative hidden lg:block lg:w-[54%]"
        style={{
          backgroundImage: 'url(/login-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.18_0.05_262/0.85)] via-[oklch(0.2_0.05_262/0.35)] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-14">
          <blockquote className="max-w-md space-y-4">
            <p className="text-balance text-2xl font-medium leading-snug text-white">
              Turning decades of defence research into instantly accessible,
              AI-powered knowledge.
            </p>
            <footer className="text-sm text-white/70">
              Defence Scientific Information &amp; Documentation Centre — DRDO
            </footer>
          </blockquote>
        </div>
      </div>
    </main>
  )
}
