"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, getAuth } from "firebase/auth";
import { app } from "../../../firebaseConfig";

export default function AdminLoginPage() {
  const router = useRouter();
  const auth = getAuth(app);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      if (userCredential.user.email !== "v.i.r.a.techsolutions13@gmail.com") {
        alert("🚫 You are not authorized to access the admin portal.");
        return;
      }

      alert("✅ Admin login successful!");
      router.push("/admin/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      alert("❌ Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #001133, #000814)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.05)",
          padding: "40px",
          borderRadius: "15px",
          width: "100%",
          maxWidth: "400px",
          boxShadow: "0 0 25px rgba(11,99,208,0.4)",
          textAlign: "center",
        }}
      >
        <h2 style={{ color: "#66b3ff", marginBottom: "20px" }}>
          👨‍💼 Admin Login
        </h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Admin Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              ...buttonStyle,
              background: loading
                ? "gray"
                : "linear-gradient(90deg, #0b63d0, #007bff)",
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.2)",
  background: "rgba(0,0,0,0.3)",
  color: "white",
  marginBottom: "15px",
  outline: "none",
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  borderRadius: "10px",
  border: "none",
  color: "white",
  fontWeight: "600",
  cursor: "pointer",
  transition: "0.3s",
};
