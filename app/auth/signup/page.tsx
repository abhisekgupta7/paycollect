import SignupForm from "@/app/features/auth/components/signup";

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-[#0b0f14] px-4 py-10 text-slate-100 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-md">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
          PayCollect
        </p>
        <h1 className="mb-1 text-2xl font-semibold">Create workspace</h1>
        <p className="mb-6 text-sm text-slate-400">
          Add retailers and collect payments.
        </p>
        <SignupForm />
      </div>
    </main>
  );
}
