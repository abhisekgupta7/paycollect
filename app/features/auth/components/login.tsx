"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { loginSchema, type LoginInput } from "../types/auth.types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function LoginForm() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginInput) {
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (!result || result.error) {
        toast.error(result?.error || "Invalid email or password");
        return;
      }

      toast.success("Logged in successfully!");
      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      toast.error("Login failed. Please try again.");
      console.error("Login error:", error);
    }
  }

  async function handleGoogleLogin() {
    try {
      setIsGoogleLoading(true);
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (error) {
      toast.error("Google login failed");
      console.error("Google login error:", error);
    } finally {
      setIsGoogleLoading(false);
    }
  }

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-8 shadow-sm">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-slate-200">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            className="h-10 border-white/10 bg-white/5 text-slate-100 placeholder-slate-500 focus:border-emerald-400 focus:ring-emerald-400"
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <p className="text-xs text-red-400">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-sm font-medium text-slate-200"
          >
            Password
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            className="h-10 border-white/10 bg-white/5 text-slate-100 placeholder-slate-500 focus:border-emerald-400 focus:ring-emerald-400"
            {...form.register("password")}
          />
          {form.formState.errors.password && (
            <p className="text-xs text-red-400">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        {/* Login Button */}
        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-full h-10 bg-emerald-400 text-emerald-950 font-medium hover:bg-emerald-300"
        >
          {form.formState.isSubmitting ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white/5 px-2 text-xs font-medium text-slate-400">
            Or continue with
          </span>
        </div>
      </div>

      {/* Google Button */}
      <Button
        type="button"
        variant="outline"
        className="w-full h-10 border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
        onClick={handleGoogleLogin}
        disabled={isGoogleLoading}
      >
        {isGoogleLoading ? "Continuing..." : "Google"}
      </Button>

      <p className="mt-6 text-center text-sm text-slate-400">
        New to PayCollect?{" "}
        <Link
          href="/auth/signup"
          className="font-medium text-emerald-400 hover:text-emerald-300"
        >
          Create account
        </Link>
      </p>
    </div>
  );
}
