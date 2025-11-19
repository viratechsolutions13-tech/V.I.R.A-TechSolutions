"use client";

import { useRouter } from "next/navigation";

export default function LMSPortal() {
  const router = useRouter();

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top, #001133, #000814 80%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        color: "white",
        padding: "20px",
      }}
    >
      <h1
        style={{
          color: "#66b3ff",
          fontSize: "2rem",
          marginBottom: "20px",
          textAlign: "center",
        }}
      >
        🎓 Welcome to V.I.R.A LMS Portal
      </h1>

      <p style={{ color: "#ccc", textAlign: "center", marginBottom: "40px" }}>
        Choose your login type below to continue.
      </p>

      {/* Login Buttons */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "20px",
        }}
      >
        <button
          onClick={() => handleNavigate("/student/login")}
          style={buttonStyle}
        >
          👨‍🎓 Student Login
        </button>

        <button
          onClick={() => handleNavigate("/trainer/login")}
          style={buttonStyle}
        >
          🧑‍🏫 Trainer Login
        </button>

        <button
          onClick={() => handleNavigate("/admin/login")}
          style={buttonStyle}
        >
          🧑‍💼 Admin Login
        </button>
      </div>

      {/* Polite Note for Students */}
      <p
        style={{
          marginTop: "40px",
          textAlign: "center",
          color: "#b0c4de",
          fontSize: "15px",
          maxWidth: "700px",
          marginLeft: "auto",
          marginRight: "auto",
          lineHeight: "1.6",
          background: "rgba(255,255,255,0.05)",
          padding: "14px 18px",
          borderRadius: "10px",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 0 15px rgba(0,0,0,0.2)",
        }}
      >
        💡 <b>Note for Students:</b> After completing your payment, your access
        will be approved by the admin within <b>10 minutes</b>. Please be
        patient — if your dashboard is not accessible after that, feel free to{" "}
        <b>message or call us</b> at 📞 <b>+91 73491 24762</b>.
        <br />
        We appreciate your patience and welcome you to{" "}
        <b>V.I.R.A LMS!</b> 🌟
      </p>
    </div>
  );
}

const buttonStyle: React.CSSProperties = {
  background: "linear-gradient(90deg, #0b63d0, #007bff)",
  color: "white",
  padding: "14px 30px",
  borderRadius: "10px",
  border: "none",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: "1rem",
  boxShadow: "0 0 15px rgba(11,99,208,0.4)",
  transition: "0.3s",
  minWidth: "200px",
};
