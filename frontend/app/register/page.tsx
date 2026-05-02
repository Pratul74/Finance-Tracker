"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

const schema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[0-9]/, "Must contain a number"),
    confirm_password: z.string(),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setServerError("");
    try {
      await api.post("/auth/register/", data);
      // Auto-login after registration
      const loginRes = await api.post("/auth/login/", {
        email: data.email,
        password: data.password,
      });
      localStorage.setItem("access", loginRes.data.access);
      localStorage.setItem("refresh", loginRes.data.refresh);
      setUser(loginRes.data.user);
      router.push("/dashboard");
    } catch (err: any) {
      const detail = err?.response?.data;
      if (typeof detail === "object") {
        const msg = Object.values(detail).flat().join(" ");
        setServerError(msg);
      } else {
        setServerError("Something went wrong. Please try again.");
      }
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
          <h1>Create account</h1>
          <p>Start tracking your finances</p>
        </div>

        {serverError && (
          <div className="auth-error animate-fade-in">{serverError}</div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {(
            [
              { id: "name", label: "Full Name", type: "text", placeholder: "Jane Doe", autocomplete: "name" },
              { id: "email", label: "Email", type: "email", placeholder: "you@example.com", autocomplete: "email" },
              { id: "password", label: "Password", type: "password", placeholder: "Min. 8 characters", autocomplete: "new-password" },
              { id: "confirm_password", label: "Confirm Password", type: "password", placeholder: "Repeat password", autocomplete: "new-password" },
            ] as const
          ).map(({ id, label, type, placeholder, autocomplete }) => (
            <div key={id} className="field">
              <label className="label" htmlFor={id}>{label}</label>
              <input
                id={id}
                type={type}
                className={`input ${errors[id] ? "input-error" : ""}`}
                placeholder={placeholder}
                autoComplete={autocomplete}
                {...register(id)}
              />
              {errors[id] && (
                <span className="field-error">{errors[id]?.message}</span>
              )}
            </div>
          ))}

          <button
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? <span className="spinner" /> : "Create account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link href="/login" className="auth-link">Sign in</Link>
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
          margin-bottom: 2rem;
        }
        .auth-logo { font-size: 1.5rem; color: var(--accent); }
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
        .input-error { border-color: var(--red) !important; }
        .field-error { display: block; margin-top: 0.375rem; font-size: 0.78rem; color: var(--red); }
        .auth-submit { width: 100%; padding: 0.75rem; margin-top: 0.5rem; font-size: 0.95rem; }
        .auth-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(12, 13, 15, 0.3);
          border-top-color: #0c0d0f;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .auth-footer { margin-top: 1.5rem; text-align: center; font-size: 0.875rem; color: var(--text-muted); }
        .auth-link { color: var(--accent); font-weight: 500; text-decoration: none; }
        .auth-link:hover { text-decoration: underline; }
      `}</style>
    </main>
  );
}