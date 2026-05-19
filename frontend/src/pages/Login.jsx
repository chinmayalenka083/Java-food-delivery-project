import { useState } from "react";
import { useAuth } from "../context/useAuth";

function Login() {
  const { login, register, loading, error } = useAuth();
  const [mode, setMode] = useState("login");
  const [localError, setLocalError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalError("");

    if (mode === "signup" && !form.name.trim()) {
      setLocalError("Please enter your name.");
      return;
    }

    if (!form.email.trim() || !form.password) {
      setLocalError("Please enter email and password.");
      return;
    }

    if (form.password.length < 8) {
      setLocalError("Password must be at least 8 characters.");
      return;
    }

    try {
      if (mode === "signup") {
        await register({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
        });
        await login({
          email: form.email.trim(),
          password: form.password,
        });
      } else {
        await login({
          email: form.email.trim(),
          password: form.password,
        });
      }
    } catch (err) {
      setLocalError(err.message || `${mode === "signup" ? "Sign up" : "Login"} failed.`);
    }
  };

  const switchMode = () => {
    setLocalError("");
    setMode((current) => (current === "login" ? "signup" : "login"));
  };

  const isSignup = mode === "signup";

  return (
    <main className="auth-page">
      <section className="login-card">
        <div className="brand-block">
          <span className="eyebrow">Food delivery</span>
          <h1>{isSignup ? "Create account" : "Login"}</h1>
          <p>
            {isSignup
              ? "Sign up to start ordering food and tracking deliveries."
              : "Sign in to manage orders, cart, payments, and profile details."}
          </p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {isSignup ? (
            <label>
              <span>Name</span>
              <input
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                autoComplete="name"
              />
            </label>
          ) : null}

          <label>
            <span>Email</span>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              autoComplete="email"
            />
          </label>

          <label>
            <span>Password</span>
            <input
              type="password"
              placeholder="Enter password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete="current-password"
            />
          </label>

          {localError || error ? <p className="error-text">{localError || error}</p> : null}

          <button type="submit" disabled={loading}>
            {loading ? "Please wait..." : isSignup ? "Sign up" : "Login"}
          </button>
        </form>

        <p className="auth-switch">
          {isSignup ? "Already have an account?" : "New user?"}{" "}
          <button className="link-button" type="button" onClick={switchMode}>
            {isSignup ? "Login" : "Sign up"}
          </button>
        </p>
      </section>
    </main>
  );
}

export default Login;
