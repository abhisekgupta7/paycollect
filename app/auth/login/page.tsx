import LoginForm from "@/app/features/auth/components/login";

export default function LoginPage() {
  return <main className="min-h-screen bg-[#0b0f14] px-6 py-20 text-slate-100"><div className="mx-auto max-w-md"><p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">PayCollect</p><h1 className="mb-2 text-3xl font-semibold">Welcome back</h1><p className="mb-8 text-slate-400">Open your receivables workspace.</p><LoginForm /></div></main>;
}
