"use client";
import { useState } from "react";

export default function AuthPopup({ show, onClose, setUser }) {

  const [isRegister, setIsRegister] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginId, setLoginId] = useState("");
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  if (!show) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "login",
        loginId,
        password,
      }),
    });

    const data = await res.json();

    if (data.success) {
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      onClose();
    } else {
      setError(data.message);
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "register",
        name,
        username,
        phone,
        email,
        password,
      }),
    });

    const data = await res.json();

    if (data.success) {
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      onClose();
    } else {
      setError(data.message);
    }
    setLoading(false);
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMsg("");

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (data.success) {
      setMsg("Reset link sent to your email ✅");
    } else {
      setError(data.message);
    }
    setLoading(false);
  };

  return (
    <div className="login-overlay" onClick={onClose}>
      <div className="login-popup" onClick={(e) => e.stopPropagation()}>
        <h2>
          {isForgot ? "Forgot Password" : isRegister ? "Register" : "Login"}
        </h2>

        <form
          onSubmit={
            isForgot
              ? handleForgot
              : isRegister
              ? handleRegister
              : handleLogin
          }
          className="login-form"
        >

          {isRegister && !isForgot && (
            <>
              <input type="text" placeholder="Full Name" value={name} onChange={(e)=>setName(e.target.value)} required />
              <input type="text" placeholder="Username" value={username} onChange={(e)=>setUsername(e.target.value)} required />
              <input type="text" placeholder="Phone Number" value={phone} onChange={(e)=>setPhone(e.target.value)} required />
              <input type="email" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
            </>
          )}

          {!isRegister && !isForgot && (
            <>
              <input
                type="text"
                placeholder="Username | Phone | Email"
                value={loginId}
                onChange={(e)=>setLoginId(e.target.value)}
                required
              />

              <p
                style={{
                  fontSize: "13px",
                  color: "#0a5c36",
                  cursor: "pointer",
                  textAlign: "right",
                  marginTop: "-5px",
                  marginBottom: "5px",
                }}
                onClick={() => {
                  setIsForgot(true);
                  setError("");
                }}
              >
                Forgot Password?
              </p>
            </>
          )}

          {isForgot && (
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              required
            />
          )}

          {!isForgot && (
            <>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              required
              />
              
              </>
            
          )}

          {error && <p className="error">{error}</p>}
          {msg && <p style={{ color: "green" }}>{msg}</p>}

          <button type="submit" disabled={loading}>
            {loading
              ? "Please wait..."
              : isForgot
              ? "Send Link"
              : isRegister
              ? "Register"
              : "Login"}
          </button>
        </form>

        <p style={{ marginTop: "12px", fontSize: "14px" }}>
          {isForgot ? (
            <>
              Back to{" "}
              <span
                style={{ color: "#0a5c36", cursor: "pointer", fontWeight: "600" }}
                onClick={() => setIsForgot(false)}
              >
                Login
              </span>
            </>
          ) : isRegister ? (
            <>
              Already have an account?{" "}
              <span
                style={{ color: "#0a5c36", cursor: "pointer", fontWeight: "600" }}
                onClick={() => setIsRegister(false)}
              >
                Login
              </span>
            </>
          ) : (
            <>
              New user?{" "}
              <span
                style={{ color: "#0a5c36", cursor: "pointer", fontWeight: "600" }}
                onClick={() => setIsRegister(true)}
              >
                Register
              </span>
            </>
          )}
        </p>

      </div>
    </div>
  );
}