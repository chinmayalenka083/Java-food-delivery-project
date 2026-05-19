const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

/* =========================
   🔐 TOKEN MANAGEMENT
========================= */
const getToken = () => localStorage.getItem("token");

const setToken = (token) => {
  if (token) localStorage.setItem("token", token);
};

const setRefreshToken = (token) => {
  if (token) localStorage.setItem("refreshToken", token);
};

const removeToken = () => localStorage.removeItem("token");

/* =========================
   📦 HEADERS
========================= */
function authHeaders(customToken) {
  const token = customToken || getToken();

  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

/* =========================
   🌐 CORE REQUEST HANDLER
========================= */
async function request(path, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        ...authHeaders(),
        ...(options.headers || {}),
      },
    });

    if (!res.ok) {
      const errorText = await res.text();

      // Handle Unauthorized
      if (res.status === 401) {
        removeToken();
        window.location.href = "/login";
      }

      throw new Error(errorText || "Something went wrong");
    }

    if (res.status === 204) return null;

    return await res.json();
  } catch (error) {
    console.error("API ERROR:", error.message);
    throw error;
  }
}

/* =========================
   🔑 AUTH APIs
========================= */
const auth = {
  register: async (body) => {
    return request("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  login: async (body) => {
    const data = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    });

    const token = data?.accessToken || data?.token;
    if (token) setToken(token);
    if (data?.refreshToken) setRefreshToken(data.refreshToken);

    return data;
  },

  logout: () => {
    removeToken();
    localStorage.removeItem("refreshToken");
  },

  me: () => request("/users/me"),
};

/* =========================
   🍽️ RESTAURANT APIs
========================= */
const restaurant = {
  getAll: () => request("/restaurants"),

  getMenu: (restaurantId) =>
    request(`/restaurants/${restaurantId}/menu`),
};

/* =========================
   🛒 CART APIs
========================= */
const cart = {
  getCart: () => request("/cart"),

  addItem: (item) =>
    request("/cart/add", {
      method: "POST",
      body: JSON.stringify(item),
    }),

  removeItem: (itemId) =>
    request(`/cart/remove/${itemId}`, {
      method: "DELETE",
    }),

  clearCart: () =>
    request("/cart/clear", {
      method: "DELETE",
    }),
};

/* =========================
   📦 ORDER APIs
========================= */
const order = {
  getOrders: () => request("/orders"),

  placeOrder: (addressId) =>
    request("/orders", {
      method: "POST",
      body: JSON.stringify({ addressId }),
    }),
};

const subscription = {
  getAll: () => request("/subscriptions"),

  subscribe: (body) =>
    request("/subscriptions", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

/* =========================
   📍 ADDRESS APIs (NEW)
========================= */
const address = {
  getAll: () => request("/users/me/addresses"),

  add: (data) =>
    request("/users/me/addresses", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  remove: (id) =>
    request(`/users/me/addresses/${id}`, {
      method: "DELETE",
    }),
};

/* =========================
   📤 EXPORT ALL
========================= */
export const api = {
  auth,
  restaurant,
  cart,
  order,
  address,
  subscription,
};
