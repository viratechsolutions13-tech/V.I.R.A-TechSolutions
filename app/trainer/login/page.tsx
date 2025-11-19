"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "../../../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function TrainerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // remove injected attributes that cause hydration mismatch (dev-only, safe)
  useEffect(() => {
    const inputs = document.querySelectorAll("input, button");
    inputs.forEach((el) => {
      try {
        el.removeAttribute("fdprocessedid");
      } catch {}
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!email || !password) return setErr("Enter both email & password");
    setLoading(true);

    try {
      // Query trainer_auth collection for this email
      const q = query(collection(db, "trainer_auth"), where("email", "==", email));
      const snap = await getDocs(q);
      if (snap.empty) {
        setErr("Trainer not found. Ask admin to add you.");
        setLoading(false);
        return;
      }

      // expecting one doc per trainer
      const docData = snap.docs[0].data();
      const docId = snap.docs[0].id;

      // simple password check (you store plain password currently)
      if (docData.password !== password) {
        setErr("Invalid password");
        setLoading(false);
        return;
      }

      // store trainer info in localStorage for dashboard queries
      localStorage.setItem("trainerEmail", docData.email);
      if (docData.course) localStorage.setItem("trainerCourse", docData.course);
      localStorage.setItem("trainerId", docId);

      router.push("/trainer/dashboard");
    } catch (e) {
      console.error(e);
      setErr("Login failed. Check console.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "80vh", display: "flex", justifyContent: "center", alignItems: "center", padding: 20 }}>
      <form onSubmit={handleSubmit} style={{ width: 420, display: "grid", gap: 12 }}>
        <h2 style={{ textAlign: "center", color: "#66b3ff" }}>👩‍🏫 Trainer Login</h2>

        <input
          type="email"
          placeholder="Trainer Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            padding: 12,
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(0,0,0,0.6)",
            color: "white",
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            padding: 12,
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(0,0,0,0.6)",
            color: "white",
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: 12,
            borderRadius: 10,
            border: "none",
            color: "white",
            fontWeight: 600,
            background: "linear-gradient(90deg,#0b63d0,#007bff)",
            cursor: "pointer",
          }}
        >
          {loading ? "Signing in..." : "Login"}
        </button>

        {err && <div style={{ color: "#ff8888", textAlign: "center" }}>{err}</div>}
      </form>
    </div>
  );
}
