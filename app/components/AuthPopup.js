"use client";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  login,
  register,
  clearErrors,
} from "@/redux/actions/authActions";
import toast from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function AuthPopup({ show, onClose }) {

  const [isRegister, setIsRegister] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  const handleForgot = async (e) => {
    e.preventDefault();

    if (forgotStep === 1) {
      const toastId = toast.loading("Sending OTP...");

      try {
        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });

        const data = await res.json();

        if (data.success) {
          toast.success("OTP sent successfully", { id: toastId });
          setForgotStep(2);
          setCanResend(true);
          setCountdown(60);
        } else {
          toast.error(data.message, { id: toastId });
        }
      } catch {
        toast.error("Failed to send OTP", { id: toastId });
      }
      return;
    }

    if (forgotStep === 2) {
      const toastId = toast.loading("Verifying OTP...");

      try {
        const res = await fetch("/api/auth/verify-otp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            otp: otp.join(""),
          }),
        });

        const data = await res.json();

        if (data.success) {
          toast.success("OTP verified", { id: toastId });
          setForgotStep(3);
          setOtpAttempts(0);
        } else {
          setOtp(["", "", "", "", "", ""]);

          const attempts = otpAttempts + 1;

          setOtpAttempts(attempts);

          if (attempts >= 5) {
            toast.error(
              "Maximum OTP attempts reached. Please request a new OTP.",
              {
                id: toastId,
              }
            );

            setForgotStep(1);
            setCanResend(false);
            setCountdown(60);
            setOtpAttempts(0);

            return;
          }

          toast.error(`${data.message} (${attempts}/5)`, {
            id: toastId,
          });
        }
      } catch {
        toast.error("Verification failed", { id: toastId });
      }
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const toastId = toast.loading("Changing password...");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp: otp.join(""),
          password: newPassword,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Password changed successfully", {
          id: toastId,
        });

        setForgotStep(1);
        setIsForgot(false);
        setOtp(["", "", "", "", "", ""]);
        setEmail("");
        setNewPassword("");
        setConfirmPassword("");
        setOtpAttempts(0);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
      } else {
        toast.error(data.message, { id: toastId });
      }
    } catch {
      toast.error("Something went wrong", { id: toastId });
    }
  };

  const handleResendOtp = async () => {
    const toastId = toast.loading("Sending OTP...");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("OTP sent successfully", {
          id: toastId,
        });

        setCanResend(false);
        setCountdown(60);

        setOtp(["", "", "", "", "", ""]);
        setOtpAttempts(0);

        setTimeout(() => {
          document.getElementById("otp-0")?.focus();
        }, 100);
      } else {
        toast.error(data.message, {
          id: toastId,
        });

        setCanResend(true);
      }
    } catch (error) {
      toast.error("Failed to resend OTP", {
        id: toastId,
      });

      setCanResend(true);
    }
  };

  useEffect(() => {
    if (forgotStep !== 2 || canResend) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 60;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [forgotStep, canResend]);

  useEffect(() => {
    if (isAuthenticated && user) {
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
          {isForgot
            ? forgotStep === 1
              ? "Forgot Password"
              : forgotStep === 2
                ? "Verify OTP"
                : "Reset Password"
            : isRegister
              ? "Register"
              : "Login"}
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
                  setForgotStep(1);

                  setEmail("");
                  setOtp(["", "", "", "", "", ""]);
                  setNewPassword("");
                  setConfirmPassword("");

                  setCountdown(60);
                  setCanResend(false);
                  setOtpAttempts(0);
                  setShowNewPassword(false);
                  setShowConfirmPassword(false);

                  dispatch(clearErrors());
                }}
              >
                Forgot Password?
              </p>
            </>
          )}

          {isForgot && (
            <>
              {forgotStep === 1 && (
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              )}

              {forgotStep === 2 && (
                <>
                  <div className="otp-container">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        className="otp-input"
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => {
                          const value = e.target.value;

                          if (!/^[0-9]?$/.test(value)) return;

                          const newOtp = [...otp];
                          newOtp[index] = value;
                          setOtp(newOtp);

                          if (value && index < 5) {
                            document.getElementById(`otp-${index + 1}`)?.focus();
                          }
                        }}
                        onKeyDown={(e) => {
                          if (
                            e.key === "Backspace" &&
                            !otp[index] &&
                            index > 0
                          ) {
                            document.getElementById(`otp-${index - 1}`)?.focus();
                          }
                        }}
                        onPaste={(e) => {
                          e.preventDefault();

                          const paste = e.clipboardData
                            .getData("text")
                            .replace(/\D/g, "")
                            .slice(0, 6);

                          if (!paste) return;

                          const arr = ["", "", "", "", "", ""];

                          paste.split("").forEach((num, i) => {
                            arr[i] = num;
                          });

                          setOtp(arr);

                          const last = Math.min(paste.length, 6) - 1;

                          document.getElementById(`otp-${last}`)?.focus();
                        }}
                      />
                    ))}
                  </div>

                  <div className="resend-otp">
                    {canResend ? (
                      <span
                        className="resend-text"
                        onClick={handleResendOtp}
                      >
                        Resend OTP
                      </span>
                    ) : (
                      <span className="otp-timer">
                        Resend in {countdown}s
                      </span>
                    )}
                  </div>
                </>
              )}

              {forgotStep === 3 && (
                <>
                  <div className="password-box">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="New Password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />

                    <span
                      className="eye-icon"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>

                  <div className="password-box">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />

                    <span
                      className="eye-icon"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                </>
              )}
            </>
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
              ? isForgot
                ? forgotStep === 1
                  ? "Sending OTP..."
                  : forgotStep === 2
                    ? "Verifying OTP..."
                    : "Changing Password..."
                : isRegister
                  ? "Registering..."
                  : "Logging In..."
              : isForgot
                ? forgotStep === 1
                  ? "Send OTP"
                  : forgotStep === 2
                    ? "Verify OTP"
                    : "Change Password"
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
                style={{
                  color: "#0a5c36",
                  cursor: "pointer",
                  fontWeight: "600"
                }}
                onClick={() => {
                  setIsForgot(false);
                  setForgotStep(1);
                  setEmail("");
                  setOtp(["", "", "", "", "", ""]);
                  setNewPassword("");
                  setConfirmPassword("");
                  setCountdown(60);
                  setCanResend(false);
                  setOtpAttempts(0);
                  setShowNewPassword(false);
                  setShowConfirmPassword(false);
                }}
              >
                Login
              </span>
            </>
          ) : isRegister ? (
            <>
              Already have an account?{" "}
              <span
                style={{ color: "#0a5c36", cursor: "pointer", fontWeight: "600" }}
                onClick={() => {
                  setIsRegister(false);
                  setName("");
                  setUsername("");
                  setPhone("");
                  setEmail("");
                  setPassword("");
                }}
              >
                Login
              </span>
            </>
          ) : (
            <>
              New user?{" "}
              <span
                style={{ color: "#0a5c36", cursor: "pointer", fontWeight: "600" }}
                onClick={() => {
                  setIsRegister(true);
                  setLoginId("");
                  setPassword("");
                }}
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