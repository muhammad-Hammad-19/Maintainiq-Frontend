"use client";

const AUTH_KEY = "maintainiq_auth";

export function getStoredAuth() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed;
  } catch {
    return null;
  }
}

export function setStoredAuth(authData) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
    window.dispatchEvent(new CustomEvent("maintainiq-auth-change", { detail: authData }));
  } catch (err) {
    console.error("Failed to persist auth:", err);
  }
}

export function clearStoredAuth() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(AUTH_KEY);
    window.dispatchEvent(new CustomEvent("maintainiq-auth-change", { detail: null }));
  } catch (err) {
    console.error("Failed to clear auth:", err);
  }
}

export function isAuthenticated() {
  const auth = getStoredAuth();
  return Boolean(auth && (auth.user || auth.token));
}

export function getUserRole() {
  const auth = getStoredAuth();
  if (!auth) return null;
  const role = auth.role || auth.user?.role;
  return role ? role.toUpperCase() : null;
}
