import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase";
import { motion } from "framer-motion";
import cityVideo from "../assets/smartcity.mp4";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (isLoggedIn) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const googleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      localStorage.setItem("userName", result.user.displayName);
      localStorage.setItem("userEmail", result.user.email);
      localStorage.setItem("role", "Citizen");
      localStorage.setItem("isLoggedIn", "true");
      navigate("/dashboard");
    } catch (error) {
      console.log(error);
      alert("Google Login Failed");
    }
  };

  const handleLogin = () => {
    if (username === "admin" && password === "admin123") {
      localStorage.setItem("role", "Admin");
      localStorage.setItem("userName", "Administrator");
      localStorage.setItem("isLoggedIn", "true");
      navigate("/dashboard");
    } else if (username === "user" && password === "user123") {
      localStorage.setItem("role", "Citizen");
      localStorage.setItem("userName", "Citizen User");
      localStorage.setItem("isLoggedIn", "true");
      navigate("/dashboard");
    } else {
      alert("Invalid Credentials. Use admin/admin123 or user/user123.");
    }
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Plus Jakarta Sans', sans-serif"
      }}
    >
      <video
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover"
        }}
      >
        <source src={cityVideo} type="video/mp4" />
      </video>

      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)"
        }}
      />

      <div
        style={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          padding: "20px"
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, cubicBezier: [0.16, 1, 0.3, 1] }}
          style={{
            width: "440px",
            padding: "48px 40px",
            borderRadius: "24px",
            background: "rgba(15, 23, 42, 0.95)",
            color: "white",
            textAlign: "center",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.4)",
            border: "1px solid rgba(255, 255, 255, 0.08)"
          }}
        >
          <div style={{ display: "inline-flex", background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", padding: "12px", borderRadius: "16px", marginBottom: "16px", fontSize: "28px" }}>
            🚦
          </div>
          
          <h1 style={{ margin: "0 0 8px 0", fontSize: "28px", fontWeight: "800", letterSpacing: "-0.5px", background: "linear-gradient(135deg, #ffffff, #93c5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            SmartCity Hub
          </h1>

          <p style={{ margin: "0 0 32px 0", color: "#94a3b8", fontSize: "14px", fontWeight: "500", lineHeight: "1.5" }}>
            Traffic Control & Smart Parking Intelligence
          </p>

          <button
            onClick={googleLogin}
            style={{
              width: "100%",
              padding: "14px 20px",
              background: "white",
              color: "#0f172a",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              fontWeight: "700",
              fontSize: "15px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              boxShadow: "0 4px 12px rgba(255, 255, 255, 0.1)",
              transition: "transform 0.2s, box-shadow 0.2s"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 6px 16px rgba(255, 255, 255, 0.15)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(255, 255, 255, 0.1)";
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.22-.66-.35-1.36-.35-2.09z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              margin: "24px 0",
              color: "rgba(255, 255, 255, 0.4)",
              fontSize: "11px",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "1px"
            }}
          >
            <div style={{ flex: 1, height: "1px", background: "rgba(255, 255, 255, 0.1)" }} />
            <span style={{ padding: "0 12px" }}>or sign in below</span>
            <div style={{ flex: 1, height: "1px", background: "rgba(255, 255, 255, 0.1)" }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ textAlign: "left" }}>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  background: "rgba(255, 255, 255, 0.05)",
                  color: "white",
                  outline: "none",
                  fontSize: "14px",
                  fontWeight: "500",
                  transition: "all 0.2s ease"
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#38bdf8";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(56, 189, 248, 0.15)";
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                }}
              />
            </div>

            <div style={{ textAlign: "left" }}>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  background: "rgba(255, 255, 255, 0.05)",
                  color: "white",
                  outline: "none",
                  fontSize: "14px",
                  fontWeight: "500",
                  transition: "all 0.2s ease"
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#38bdf8";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(56, 189, 248, 0.15)";
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                }}
              />
            </div>

            <button
              onClick={handleLogin}
              style={{
                width: "100%",
                padding: "14px 20px",
                background: "linear-gradient(135deg, #10b981, #059669)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                cursor: "pointer",
                fontWeight: "700",
                fontSize: "15px",
                boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)",
                transition: "transform 0.2s, box-shadow 0.2s"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 6px 16px rgba(16, 185, 129, 0.3)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.2)";
              }}
            >
              Sign In
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Login;