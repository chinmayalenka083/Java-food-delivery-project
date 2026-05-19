import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import "./styles.css";

/* =========================
   🧠 GLOBAL CONTEXTS
========================= */
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

/* =========================
   🛑 ERROR BOUNDARY
========================= */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("App Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h2>Something went wrong 😢</h2>;
    }
    return this.props.children;
  }
}

/* =========================
   🚀 ROOT RENDER
========================= */
const root = createRoot(document.getElementById("root"));

root.render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>
);
