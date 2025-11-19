"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "../../../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function StudentLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: any) {
    e.preventDefault();

    setLoading(true);

    const q = query(collection(db, "students_info"), where("email", "==", email));
    const snap = await getDocs(q);

    if (snap.empty) {
      alert("Student not found.");
      setLoading(false);
      return;
    }

    const st = snap.docs[0].data();

    if (!st.accessGranted) {
      alert("Payment not approved yet.");
      setLoading(false);
      return;
    }

    localStorage.setItem("studentEmail", email);
    router.push("/student/dashboard");
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(circle at top,#001133,#000814)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      color: "white",
    }}>
      <form onSubmit={handleLogin} style={{
        width: "100%",
        maxWidth: 400,
        background: "rgba(255,255,255,0.05)",
        padding: 26,
        borderRadius: 12,
      }}>
        <h2 style={{ textAlign: "center", color: "#66b3ff" }}>🎓 Student Login</h2>

        <input
          type="email"
          style={input}
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button type="submit" style={button} disabled={loading}>
          {loading ? "Checking..." : "Login"}
        </button>

        <p style={{ textAlign: "center", marginTop: 10 }}>
          New user? <a href="/student/payment" style={{ color: "#66b3ff" }}>Register</a>
        </p>
      </form>
    </div>
  );
}

const input = {
  padding: 12,
  width: "100%",
  borderRadius: 8,
  marginTop: 12,
  background: "rgba(0,0,0,0.35)",
  color: "white",
  border: "1px solid rgba(255,255,255,0.15)",
};

const button = {
  padding: 12,
  width: "100%",
  marginTop: 20,
  borderRadius: 8,
  border: "none",
  color: "white",
  background: "linear-gradient(90deg,#0b63d0,#007bff)",
};
