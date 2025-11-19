"use client";

import { useState } from "react";
import { db } from "../../../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function StudentDetailsPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    age: "",
    college: "",
    year: "",
    passedOut: false,
    phone: "",
    email: "",
    course: "",
    isDemo: false,
  });

  const [loading, setLoading] = useState(false);

  const courses = [
    "Basic Python",
    "Basic Java",
    "Web Development",
    "App Development",
    "UI/UX Design",
    "Java Full Stack",
  ];

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDoc(collection(db, "students_info"), {
        ...form,
        createdAt: serverTimestamp(),
      });

      alert("✅ Your details have been saved successfully!");
      router.push("/student/payment");
    } catch (error) {
      console.error("Error saving details:", error);
      alert("❌ Failed to save details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top, #001133, #000814 80%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(20px)",
          borderRadius: "20px",
          padding: "40px",
          width: "100%",
          maxWidth: "550px",
          color: "white",
          boxShadow: "0 0 25px rgba(11,99,208,0.4)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            marginBottom: "20px",
            fontSize: "1.8rem",
            color: "#66b3ff",
          }}
        >
          🎓 Student Information
        </h1>

        <div style={{ display: "grid", gap: "18px" }}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
            style={inputStyle}
          />
          <input
            type="number"
            name="age"
            placeholder="Age"
            value={form.age}
            onChange={handleChange}
            required
            style={inputStyle}
          />
          <input
            type="text"
            name="college"
            placeholder="College Name"
            value={form.college}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          {!form.passedOut && (
            <select
              name="year"
              value={form.year}
              onChange={handleChange}
              required
              style={inputStyle}
            >
              <option value="">Select Year of Study</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
            </select>
          )}

          <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <input
              type="checkbox"
              name="passedOut"
              checked={form.passedOut}
              onChange={handleChange}
              style={{ width: "18px", height: "18px" }}
            />
            Passed Out Student
          </label>

          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={form.phone}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <select
            name="course"
            value={form.course}
            onChange={handleChange}
            required
            style={inputStyle}
          >
            <option value="">Select Course</option>
            {courses.map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>

          <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <input
              type="checkbox"
              name="isDemo"
              checked={form.isDemo}
              onChange={handleChange}
              style={{ width: "18px", height: "18px" }}
            />
            Enroll for 1-Day Demo Class (₹89)
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: "25px",
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            border: "none",
            background: loading
              ? "gray"
              : "linear-gradient(90deg, #0b63d0, #007bff)",
            color: "white",
            fontWeight: "600",
            fontSize: "1rem",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "0.3s",
          }}
        >
          {loading ? "Saving..." : "Next → Payment"}
        </button>
      </form>
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
  fontSize: "1rem",
  outline: "none",
  transition: "0.3s",
};
