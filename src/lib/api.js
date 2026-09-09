import { clearStoredAuth } from "./auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload.success === false) {
    if (response.status === 401) {
      clearStoredAuth();
    }
    throw new Error(payload.message || "Request failed");
  }

  return payload;
}

export const api = {
  getTechnicians: async () => {
    const res = await fetch(`${API_BASE_URL}/workorders/technicians`, {
      credentials: "include",
    });
    return res.json();
  },

  assignWorkOrder: async (workOrderId, technicianId) => {
    const res = await fetch(
      `${API_BASE_URL}/workorders/${workOrderId}/assign`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ technicianId }),
      },
    );
    return res.json();
  },
  login: (body) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  register: (body) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  logout: async () => {
    try {
      return await request("/auth/logout", { method: "POST" });
    } finally {
      clearStoredAuth();
    }
  },
  getAssets: () => request("/assets"),
  getAssetByQrId: (qrId) => request(`/assets/${encodeURIComponent(qrId)}`),
  createAsset: (body) =>
    request("/assets", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateAsset: (id, body) =>
    request(`/assets/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  deleteAsset: (id) =>
    request(`/assets/${id}`, {
      method: "DELETE",
    }),
  getWorkOrders: (status = "OPEN") =>
    request(`/workorders?status=${encodeURIComponent(status)}`),
  getMyJobs: () => request("/workorders/my-jobs"),
  updateWorkOrderStatus: (id, body) =>
    request(`/workorders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  createReport: (body) =>
    request("/reports", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

export function decodeRole(loginPayload) {
  const token = loginPayload?.data?.token;
  if (!token || typeof window === "undefined") return null;

  try {
    const encodedPayload = token.split(".")[1];
    const normalized = encodedPayload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(window.atob(normalized)).role;
  } catch {
    return null;
  }
}

export function formatDate(value) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function getLocation(asset) {
  const location = asset?.location || {};
  return (
    [location.building, location.floor, location.area]
      .filter(Boolean)
      .join(" / ") || "No location"
  );
}
