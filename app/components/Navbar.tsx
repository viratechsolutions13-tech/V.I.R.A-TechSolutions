"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  return (
    <nav
      style={{
        background: "rgba(0, 0, 20, 0.95)",
        color: "white",
        padding: "12px 30px",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 2px 10px rgba(0,0,0,0.4)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          maxWidth: "1200px",
          margin: "auto",
        }}
      >
        {/* 🔵 Logo + Brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            cursor: "pointer",
          }}
          onClick={() => router.push("/")}
        >
          <img
            src="/logo.png"
            alt="VIRA Logo"
            style={{
              width: "45px",
              height: "45px",
              borderRadius: "50%",
              border: "2px solid #0b63d0",
              boxShadow: "0 0 10px #0b63d0",
            }}
          />
          <h1
            style={{
              fontSize: "1.2rem",
              fontWeight: 700,
              color: "#0b63d0",
              letterSpacing: "1px",
            }}
          >
            V.I.R.A Tech Solutions
          </h1>
        </div>

        {/* 🖥️ Desktop Menu */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "30px",
          }}
          className="desktop-menu"
        >
          <div className="nav-links" style={{ display: "flex", gap: "25px" }}>
            <Link href="/" style={linkStyle} onClick={closeMenu}>
              Home
            </Link>
            <Link href="/about" style={linkStyle} onClick={closeMenu}>
              About
            </Link>
            <Link href="/courses" style={linkStyle} onClick={closeMenu}>
              Courses
            </Link>
            <Link href="/careers" style={linkStyle} onClick={closeMenu}>
              Careers
            </Link>
          </div>

          <Link href="/login" style={lmsButton} onClick={closeMenu}>
            🎓 LMS Portal
          </Link>
        </div>

        {/* 📱 Hamburger Icon */}
        <div
          onClick={toggleMenu}
          style={{
            display: "none",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
          }}
          className="mobile-menu-icon"
        >
          <div style={bar}></div>
          <div style={bar}></div>
          <div style={bar}></div>
        </div>
      </div>

      {/* 📱 Mobile Slide Menu */}
      {menuOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            width: "75%",
            height: "100%",
            background: "#000a1f",
            boxShadow: "-2px 0 10px rgba(0,0,0,0.5)",
            display: "flex",
            flexDirection: "column",
            padding: "40px 20px",
            transition: "transform 0.3s ease-in-out",
          }}
        >
          <button
            onClick={closeMenu}
            style={{
              alignSelf: "flex-end",
              background: "transparent",
              border: "none",
              color: "white",
              fontSize: "1.8rem",
              cursor: "pointer",
              marginBottom: "20px",
            }}
          >
            ✕
          </button>

          <Link href="/" style={mobileLink} onClick={closeMenu}>
            Home
          </Link>
          <Link href="/about" style={mobileLink} onClick={closeMenu}>
            About
          </Link>
          <Link href="/courses" style={mobileLink} onClick={closeMenu}>
            Courses
          </Link>
          <Link href="/careers" style={mobileLink} onClick={closeMenu}>
            Careers
          </Link>
          <Link href="/login" style={mobileLmsButton} onClick={closeMenu}>
            🎓 LMS Portal
          </Link>
        </div>
      )}
    </nav>
  );
}

// 🔗 Styles
const linkStyle: React.CSSProperties = {
  color: "white",
  textDecoration: "none",
  fontWeight: 500,
  transition: "0.3s",
};

const lmsButton: React.CSSProperties = {
  background: "linear-gradient(90deg, #0b63d0, #007bff)",
  color: "white",
  padding: "10px 22px",
  borderRadius: "8px",
  textDecoration: "none",
  fontWeight: 600,
  boxShadow: "0 0 10px rgba(11,99,208,0.4)",
  transition: "0.3s",
};

const bar: React.CSSProperties = {
  width: "25px",
  height: "3px",
  backgroundColor: "#0b63d0",
  margin: "4px 0",
  borderRadius: "2px",
};

const mobileLink: React.CSSProperties = {
  color: "white",
  textDecoration: "none",
  fontSize: "1.1rem",
  margin: "10px 0",
};

const mobileLmsButton: React.CSSProperties = {
  background: "linear-gradient(90deg, #0b63d0, #007bff)",
  color: "white",
  padding: "12px 24px",
  borderRadius: "8px",
  textDecoration: "none",
  fontWeight: 600,
  textAlign: "center",
  marginTop: "20px",
  boxShadow: "0 0 10px rgba(11,99,208,0.4)",
};
