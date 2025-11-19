import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "V.I.R.A Tech Solutions",
  description: "Innovate • Educate • Create • Work",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          backgroundColor: "#000814",
          color: "white",
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        {/* 🧭 NAVBAR */}
        <nav
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "rgba(0, 10, 40, 0.95)",
            backdropFilter: "blur(10px)",
            padding: "14px 40px",
            position: "sticky",
            top: 0,
            zIndex: 1000,
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.5)",
          }}
        >
          {/* 🔵 Logo + Name */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <img
              src="/logo.png"
              alt="VIRA Logo"
              style={{
                width: "45px",
                height: "45px",
                borderRadius: "50%",
                border: "2px solid #0b63d0",
                boxShadow: "0 0 8px #0b63d0",
              }}
            />
            <h1
              style={{
                fontSize: "1.3rem",
                fontWeight: "700",
                color: "#0b63d0",
                letterSpacing: "1px",
              }}
            >
              V.I.R.A Tech Solutions
            </h1>
          </div>

          {/* 🔗 Menu Links */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "30px",
            }}
          >
            <Link
              href="/"
              style={{
                color: "white",
                textDecoration: "none",
                fontWeight: 500,
                transition: "0.3s",
              }}
            >
              Home
            </Link>

            <Link
              href="/about"
              style={{
                color: "white",
                textDecoration: "none",
                fontWeight: 500,
                transition: "0.3s",
              }}
            >
              About
            </Link>

            <Link
              href="/courses"
              style={{
                color: "white",
                textDecoration: "none",
                fontWeight: 500,
                transition: "0.3s",
              }}
            >
              Courses
            </Link>

            <Link
              href="/careers"
              style={{
                color: "white",
                textDecoration: "none",
                fontWeight: 500,
                transition: "0.3s",
              }}
            >
              Careers
            </Link>

            {/* 🎓 LMS Portal Button */}
            <Link
              href="/lms"
              style={{
                background: "linear-gradient(90deg, #0b63d0, #007bff)",
                color: "white",
                padding: "10px 22px",
                borderRadius: "8px",
                textDecoration: "none",
                fontWeight: 600,
                boxShadow: "0 0 10px rgba(11,99,208,0.4)",
                transition: "0.3s",
              }}
            >
              🎓 LMS Portal
            </Link>
          </div>
        </nav>

        {/* Main Content */}
        <main style={{ paddingTop: "80px" }}>{children}</main>
      </body>
    </html>
  );
}
