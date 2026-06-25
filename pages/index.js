import { useState, useEffect, useCallback } from "react";
import Head from "next/head";

function AuthForm({ onAuth }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("signin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const endpoint = mode === "signin" ? "/api/supabase/signin" : "/api/supabase/signup";
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onAuth(data.user, data.session);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto", padding: "2rem", background: "#1a1a2e", borderRadius: 12, border: "1px solid #333" }}>
      <h2 style={{ margin: 0, marginBottom: "1rem", color: "#e0e0e0" }}>
        {mode === "signin" ? "Sign In" : "Sign Up"}
      </h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: "0.6rem", borderRadius: 6, border: "1px solid #444", background: "#0d0d1a", color: "#e0e0e0" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          style={{ padding: "0.6rem", borderRadius: 6, border: "1px solid #444", background: "#0d0d1a", color: "#e0e0e0" }}
        />
        {error && <p style={{ color: "#f85149", margin: 0, fontSize: "0.85rem" }}>{error}</p>}
        <button
          type="submit"
          disabled={loading}
          style={{ padding: "0.6rem", borderRadius: 6, border: "none", background: "#3ecf8e", color: "#000", fontWeight: 600, cursor: "pointer" }}
        >
          {loading ? "..." : mode === "signin" ? "Sign In" : "Sign Up"}
        </button>
      </form>
      <p style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.85rem", color: "#888" }}>
        {mode === "signin" ? "No account? " : "Already have an account? "}
        <button
          onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); }}
          style={{ background: "none", border: "none", color: "#3ecf8e", cursor: "pointer", textDecoration: "underline" }}
        >
          {mode === "signin" ? "Sign up" : "Sign in"}
        </button>
      </p>
    </div>
  );
}

function TodoList({ user, onSignOut }) {
  const [todos, setTodos] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(true);

  const loadTodos = useCallback(async () => {
    try {
      const res = await fetch("/api/supabase/todos");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTodos(data.todos || []);
    } catch (err) {
      console.error("Failed to load todos:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTodos(); }, [loadTodos]);

  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const res = await fetch("/api/supabase/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle }),
    });
    const data = await res.json();
    if (res.ok) {
      setTodos([data.todo, ...todos]);
      setNewTitle("");
    }
  };

  const toggleTodo = async (id, completed) => {
    const res = await fetch("/api/supabase/todos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, completed: !completed }),
    });
    if (res.ok) {
      setTodos(todos.map((t) => (t.id === id ? { ...t, completed: !completed } : t)));
    }
  };

  const deleteTodo = async (id) => {
    const res = await fetch("/api/supabase/todos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setTodos(todos.filter((t) => t.id !== id));
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto", padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ margin: 0, color: "#e0e0e0" }}>Todos</h2>
          <p style={{ margin: 0, fontSize: "0.8rem", color: "#888" }}>{user?.email}</p>
        </div>
        <button
          onClick={onSignOut}
          style={{ padding: "0.4rem 0.8rem", borderRadius: 6, border: "1px solid #444", background: "transparent", color: "#888", cursor: "pointer" }}
        >
          Sign Out
        </button>
      </div>

      <form onSubmit={addTodo} style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Add a todo..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          style={{ flex: 1, padding: "0.6rem", borderRadius: 6, border: "1px solid #444", background: "#0d0d1a", color: "#e0e0e0" }}
        />
        <button
          type="submit"
          style={{ padding: "0.6rem 1rem", borderRadius: 6, border: "none", background: "#3ecf8e", color: "#000", fontWeight: 600, cursor: "pointer" }}
        >
          Add
        </button>
      </form>

      {loading ? (
        <p style={{ color: "#888" }}>Loading...</p>
      ) : todos.length === 0 ? (
        <p style={{ color: "#888", textAlign: "center" }}>No todos yet. Add one above!</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {todos.map((todo) => (
            <li
              key={todo.id}
              style={{
                display: "flex", alignItems: "center", gap: "0.75rem",
                padding: "0.75rem 1rem", background: "#1a1a2e", borderRadius: 8, border: "1px solid #333",
              }}
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id, todo.completed)}
                style={{ cursor: "pointer" }}
              />
              <span style={{ flex: 1, color: "#e0e0e0", textDecoration: todo.completed ? "line-through" : "none", opacity: todo.completed ? 0.5 : 1 }}>
                {todo.title}
              </span>
              <button
                onClick={() => deleteTodo(todo.id)}
                style={{ background: "none", border: "none", color: "#f85149", cursor: "pointer", fontSize: "1rem" }}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Home() {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);

  const handleAuth = (user, session) => {
    setUser(user);
    setSession(session);
  };

  const handleSignOut = async () => {
    await fetch("/api/supabase/signout", { method: "POST" });
    setUser(null);
    setSession(null);
  };

  return (
    <>
      <Head>
        <title>Supabase + Vercel</title>
      </Head>
      <div style={{ minHeight: "100vh", background: "#0d0d1a", fontFamily: "system-ui, sans-serif" }}>
        <header style={{ padding: "1rem 2rem", borderBottom: "1px solid #222", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <svg width="20" height="20" viewBox="0 0 109 113" fill="none">
            <path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z" fill="url(#paint0_linear)" />
            <path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z" fill="url(#paint1_linear)" fillOpacity="0.2" />
            <path d="M45.317 2.07103C48.1765 -1.53037 53.9745 0.442937 54.0434 5.041L54.4849 72.2922H9.83113C1.64038 72.2922 -2.92775 62.8321 2.1655 56.4175L45.317 2.07103Z" fill="#3ECF8E" />
            <defs>
              <linearGradient id="paint0_linear" x1="53.9738" y1="54.974" x2="94.1635" y2="71.8295" gradientUnits="userSpaceOnUse">
                <stop stopColor="#249361" />
                <stop offset="1" stopColor="#3ECF8E" />
              </linearGradient>
              <linearGradient id="paint1_linear" x1="36.1558" y1="30.578" x2="54.4844" y2="65.0806" gradientUnits="userSpaceOnUse">
                <stop />
                <stop offset="1" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
          <h1 style={{ margin: 0, fontSize: "1.1rem", color: "#e0e0e0" }}>Supabase + Vercel</h1>
        </header>

        {user ? (
          <TodoList user={user} onSignOut={handleSignOut} />
        ) : (
          <AuthForm onAuth={handleAuth} />
        )}
      </div>
    </>
  );
}
