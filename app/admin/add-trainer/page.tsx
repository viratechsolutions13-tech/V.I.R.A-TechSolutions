"use client";

import { useState } from "react";
import { db } from "../../../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

export default function AddTrainerPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    course: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password || !form.course) {
      return alert("Please fill all fields");
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "trainer_auth"), {
        ...form,
        createdAt: new Date().toISOString(),
      });

      alert("✅ Trainer added successfully!");
      setForm({ name: "", email: "", password: "", course: "" });
    } catch (error) {
      console.error(error);
      alert("❌ Failed to add trainer");
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#001133,#000814)",
        color: "white",
        padding: "30px",
      }}
    >
      <h1 style={{ textAlign: "center", color: "#66b3ff" }}>
        ➕ Add New Trainer
      </h1>

      <form
        onSubmit={handleSubmit}
        style={{
          maxWidth: 500,
          margin: "40px auto",
          background: "rgba(255,255,255,0.05)",
          padding: "25px",
          borderRadius: "12px",
          boxShadow: "0 0 20px rgba(11,99,208,0.3)",
        }}
      >
        <input
          type="text"
          name="name"
          placeholder="Trainer Name"
          value={form.name}
          onChange={handleChange}
          style={input}
        />

        <input
          type="email"
          name="email"
          placeholder="Trainer Email"
          value={form.email}
          onChange={handleChange}
          style={input}
        />

        <input
          type="text"
          name="password"
          placeholder="Trainer Password"
          value={form.password}
          onChange={handleChange}
          style={input}
        />

        <input
          type="text"
          name="course"
          placeholder="Course (e.g., Python, Java, UI/UX)"
          value={form.course}
          onChange={handleChange}
          style={input}
        />

        <button
          type="submit"
          disabled={loading}
          style={button}
        >
          {loading ? "Adding..." : "Add Trainer"}
        </button>
      </form>
    </div>
  );
}

const input: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  borderRadius: "8px",
  marginBottom: "12px",
  border: "1px solid rgba(255,255,255,0.2)",
  background: "rgba(0,0,0,0.3)",
  color: "white",
  outline: "none",
};

const button: React.CSSProperties = {
  width: "100%",
  padding: "15px",
  borderRadius: "8px",
  border: "none",
  background: "linear-gradient(90deg,#0b63d0,#007bff)",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};
