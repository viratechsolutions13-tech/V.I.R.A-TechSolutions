"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebaseConfig";

export default function StudentPaymentPage() {
  const router = useRouter();

  const coursePrices: Record<string, number> = {
    "Python for Beginners": 2000,
    "Core Java Programming": 2999,
    "Web Design & Development": 2599,
    "Android App Development": 2999,
    "Java Full Stack Development": 3499,
    "UI/UX Design": 2999,
    "1-2 months intern learning": 3000,
    "Basic python": 459,
    "Basic java": 520,
    "HTML , CSs": 459,
    "Interships": 6000,
    "Intern and placement": 10000,
  };

  const demoPrice = 89;

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    college: "",
    year: "",
    passedOut: false,
    course: "",
    isDemo: false,
    upiIdUsed: "",
    paymentMethod: "UPI",
  });

  const [proofDataUrl, setProofDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e: any) {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  }

  function handleFile(e: any) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProofDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  function computeAmount() {
    return form.isDemo ? demoPrice : coursePrices[form.course] ?? 0;
  }

  async function handleSubmit(e: any) {
    e.preventDefault();

    if (!form.name || !form.email || !form.phone || !form.course) {
      return alert("Please fill required fields.");
    }
    if (!proofDataUrl) {
      return alert("Upload payment screenshot.");
    }

    setLoading(true);
    try {
      const amount = computeAmount();

      const paymentDoc: any = {
        ...form,
        courseTitle: form.course,
        amount,
        paymentProof: proofDataUrl,
        status: "pending",
        createdAt: serverTimestamp(),
      };

      if (form.isDemo) {
        paymentDoc.expiresAt = new Date(Date.now() + 86400000).toISOString();
      }

      await addDoc(collection(db, "payments_pending"), paymentDoc);

      alert("Payment submitted! Admin will approve shortly.");
      router.push("/student/login");
    } catch (err) {
      console.error(err);
      alert("Failed! Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        color: "white",
        background: "radial-gradient(circle at top,#001133,#000814 80%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: 24,
        gap: 24,
        flexWrap: "wrap", // IMPORTANT FIX
      }}
    >
      {/* LEFT SIDE — FORM */}
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: 780,
          background: "rgba(255,255,255,0.04)",
          padding: 26,
          borderRadius: 14,
          boxShadow: "0 0 25px rgba(11,99,208,0.3)",
        }}
      >
        <h2 style={{ textAlign: "center", color: "#66b3ff" }}>
          💳 Student Payment
        </h2>

        <div style={{ display: "grid", gap: 12, marginTop: 20 }}>
          <input style={input} placeholder="Full Name" name="name" value={form.name} onChange={handleChange} required />
          <input style={input} placeholder="Phone" name="phone" value={form.phone} onChange={handleChange} required />
          <input style={input} placeholder="Email" name="email" value={form.email} onChange={handleChange} required />
          <input style={input} placeholder="College" name="college" value={form.college} onChange={handleChange} />
          <input style={input} placeholder="Year" name="year" value={form.year} onChange={handleChange} />

          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" name="passedOut" checked={form.passedOut} onChange={handleChange} /> Passed Out
          </label>

          <select name="course" value={form.course} onChange={handleChange} style={input} required>
            <option value="">Select Course</option>
            {Object.keys(coursePrices).map((c) => (
              <option key={c} value={c}>
                {c} — ₹{coursePrices[c]}
              </option>
            ))}
          </select>

          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" name="isDemo" checked={form.isDemo} onChange={handleChange} />
            Join Demo Class (₹89)
          </label>

          <div style={{ background: "rgba(0,0,0,0.35)", padding: 12, borderRadius: 10 }}>
            <h3 style={{ margin: 0 }}>Amount: ₹{computeAmount()}</h3>
          </div>

          <div style={{ textAlign: "center" }}>
            <img src="/upi-qr.png" style={{ width: 180, borderRadius: 10 }} />
            <p style={{ marginTop: 8, color: "#aaa" }}>Scan & Pay</p>
          </div>

          <label
            style={{
              border: "2px dashed #0b63d0",
              padding: "25px",
              borderRadius: 12,
              textAlign: "center",
              cursor: "pointer",
              background: "rgba(0,0,0,0.25)",
            }}
          >
            <span style={{ color: "#66b3ff", fontSize: 15, fontWeight: 600 }}>
              📤 Click here to upload Payment Screenshot
            </span>
            <input type="file" accept="image/*" onChange={handleFile} required style={{ display: "none" }} />
          </label>

          {proofDataUrl && (
            <img src={proofDataUrl} style={{ width: 220, marginTop: 10, borderRadius: 8, border: "1px solid #0b63d0" }} />
          )}

          <button style={button} disabled={loading}>
            {loading ? "Submitting..." : "Submit Payment"}
          </button>
        </div>
      </form>

      {/* RIGHT SIDE — IMPORTANT NOTE */}
      <div
        style={{
          background: "rgba(255,255,255,0.04)",
          padding: 24,
          borderRadius: 14,
          width: "350px",
          maxWidth: "100%", // FIX FOR MOBILE
          height: "fit-content",
          boxShadow: "0 0 25px rgba(0,0,0,0.3)",
        }}
      >
        <h3 style={{ color: "#66b3ff", marginBottom: 10 }}>📌 Important Payment Instructions</h3>

        <ul style={{ lineHeight: "1.8", fontSize: 14, color: "#ddd" }}>
          <li>Scan the QR code and enter the correct amount.</li>
          <li>You can pay using PhonePe, Google Pay, Paytm etc.</li>
          <li>Take a screenshot after payment.</li>
          <li>Upload the screenshot in the upload box.</li>
          <li>Your payment will be sent to the admin.</li>
          <li>Admin will approve your payment shortly.</li>
          <li>After approval, your course access gets activated.</li>
          <li>After submitting, wait 5 mins and login with your email.</li>
          <li>If you face any issue, call +91 7349124762 anytime.</li>
        </ul>
      </div>
    </div>
  );
}

const input: React.CSSProperties = {
  padding: 12,
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(0,0,0,0.35)",
  color: "white",
};

const button: React.CSSProperties = {
  padding: "12px 16px",
  borderRadius: 10,
  border: "none",
  background: "linear-gradient(90deg,#0b63d0,#007bff)",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};
