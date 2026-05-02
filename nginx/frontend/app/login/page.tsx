"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setServerError("");
    try {
      const res = await api.post("/auth/login/", data);
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      setUser(res.data.user);
      router.push("/dashboard");
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setServerError(detail ?? "Invalid email or password.");
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-brand">
        <span className="auth-logo">◈</span>
        <span>Fintrack</span>
      </div>

      <div className="auth-card animate-fade-up">
        <div className="auth-header">
          <h1>Welcome back</h1>
          <p>Sign in to your account</p>
        </div>

        {serverError && (
          <div className="auth-error animate-fade-in">{serverError}</div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="field">
            <label className="label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className={`input ${errors.email ? "input-error" : ""}`}
              placeholder="you@example.com"
              autoComplete="email"
              {...register("email")}
            />
            {errors.email && (
              <span className="field-error">{errors.email.message}</span>
            )}
          </div>

          <div className="field">
            <label className="label" htmlFor="password">Password</label>
            <div className="input-wrap">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className={`input ${errors.password ? "input-error" : ""}`}
                placeholder="••••••••"
                autoComplete="current-password"
                {...register("password")}
              />
              <button
                type="button"
                className="input-icon"
                onClick={() => setShowPassword((p) => !p)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>
            {errors.password && (
              <span className="field-error">{errors.password.message}</span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? <span className="spinner" /> : "Sign in"}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account?{" "}
          <Link href="/register" className="auth-link">
            Create one
          </Link>
        </p>
      </div>

      <style jsx>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: radial-gradient(
              ellipse 60% 40% at 50% 0%,
              rgba(245, 158, 11, 0.06) 0%,
              transparent 70%
            ),
            var(--bg);
        }
        .auth-brand {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 1.1rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--text);
          margin-bottom: 2rem;
        }
        .auth-logo {
          font-size: 1.5rem;
          color: var(--accent);
        }
        .auth-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 2.5rem;
          width: 100%;
          max-width: 420px;
          box-shadow: var(--shadow);
        }
        .auth-header { margin-bottom: 2rem; }
        .auth-header h1 {
          font-size: 1.6rem;
          font-weight: 700;
          letter-spacing: -0.03em;
          margin-bottom: 0.25rem;
        }
        .auth-header p { color: var(--text-muted); font-size: 0.9rem; }

        .auth-error {
          background: var(--red-dim);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: var(--red);
          border-radius: var(--radius-sm);
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          margin-bottom: 1.25rem;
        }

        .field { margin-bottom: 1.25rem; }
        .input-wrap { position: relative; }
        .input-wrap .input { padding-right: 2.5rem; }
        .input-icon {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          font-size: 0.9rem;
          color: var(--text-muted);
          padding: 0;
        }
        .input-error { border-color: var(--red) !important; }
        .field-error {
          display: block;
          margin-top: 0.375rem;
          font-size: 0.78rem;
          color: var(--red);
        }

        .auth-submit {
          width: 100%;
          padding: 0.75rem;
          margin-top: 0.5rem;
          font-size: 0.95rem;
        }
        .auth-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(12, 13, 15, 0.3);
          border-top-color: #0c0d0f;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .auth-footer {
          margin-top: 1.5rem;
          text-align: center;
          font-size: 0.875rem;
          color: var(--text-muted);
        }
        .auth-link { color: var(--accent); font-weight: 500; text-decoration: none; }
        .auth-link:hover { text-decoration: underline; }
      `}</style>
    </main>
  );
}