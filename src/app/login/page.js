"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import { api, decodeRole } from "../../lib/api";
import { setStoredAuth } from "../../lib/auth";
import ThemeToggle from "../../components/ThemeToggle";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setLoading(true);

    try {
      const payload = await api.login(form);
      const role = decodeRole(payload) || payload?.data?.user?.role || "TECHNICIAN";

      // Persist auth for frontend route guard & role resolution
      setStoredAuth({
        user: payload?.data?.user,
        role: role,
        token: payload?.data?.token,
      });

      toast.success("Login successful! Redirecting...");

      setTimeout(() => {
        router.push(role === "ADMIN" ? "/admin" : "/technician");
      }, 500);
    } catch (err) {
      toast.error(err.message || "Login failed. Please verify credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={onSubmit}>
        <div className="flex items-center justify-between">
          <Link href="/" className="brand p-0">
            <span className="brand-mark">M</span>
            <div>
              <strong>MaintainIQ</strong>
              <small>Operations Authentication</small>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/"
              className="text-xs font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              &larr; Home
            </Link>
          </div>
        </div>

        <div>
          <span className="eyebrow">Enterprise Sign In</span>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">Welcome back</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Access the facility operations console or technician dispatch portal.
          </p>
        </div>

        <label>
          Email address
          <input
            type="email"
            placeholder="admin@maintainiq.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            autoComplete="email"
          />
        </label>

        <label>
          <div className="flex items-center justify-between">
            <span>Password</span>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-[11px] font-medium text-teal-700 dark:text-teal-400 hover:text-teal-900 dark:hover:text-teal-300 cursor-pointer"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              autoComplete="current-password"
            />
          </div>
        </label>

        <button
          type="submit"
          className="primary-button full py-3 font-semibold text-sm shadow-md mt-1 cursor-pointer"
          disabled={loading}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white dark:text-slate-950" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Authenticating...</span>
            </>
          ) : (
            <span>Sign In to MaintainIQ</span>
          )}
        </button>

        <p className="auth-switch text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          New field technician?{" "}
          <Link href="/register" className="font-semibold text-teal-700 dark:text-teal-400 hover:underline">
            Register an account
          </Link>
        </p>
      </form>
    </main>
  );
}
