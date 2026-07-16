"use client";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  login,
  register,
  forgotPassword,
  clearErrors,
} from "@/redux/actions/authActions";

export default function AuthPopup({ show, onClose }) {

  const [isRegister, setIsRegister] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginId, setLoginId] = useState("");
  const dispatch = useDispatch();

  const {
    loading,
    error,
    message,
    isAuthenticated,
    user,
  } = useSelector((state) => state.auth);


  const handleLogin = (e) => {
    e.preventDefault();

    dispatch(
      login({
        loginId,
        password,
      })
    );
  };

  const handleRegister = (e) => {
    e.preventDefault();

    dispatch(
      register({
        name,
        username,
        phone,
        email,
        password,
      })
    );
  };

  const handleForgot = (e) => {
    e.preventDefault();

    dispatch(forgotPassword(email));
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      // localStorage.setItem("user", JSON.stringify(user));
      onClose();
    }

    if (error) {
      dispatch(clearErrors());
    }
  }, [dispatch, error, isAuthenticated, user, onClose]);

  if (!show) return null;

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
              <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
              <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
              <input type="text" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </>
          )}

          {!isRegister && !isForgot && (
            <>
              <input
                type="text"
                placeholder="Username | Phone | Email"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
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
                  dispatch(clearErrors());
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
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          )}

          {!isForgot && (
            <>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

            </>

          )}

          {error && <p className="error">{error}</p>}
          {message && (
            <p style={{ color: "green" }}>
              {message}
            </p>
          )}

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