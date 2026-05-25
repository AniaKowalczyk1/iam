import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";

import "./LoginPage.css";

export default function LoginPage() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [captchaToken, setCaptchaToken] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const login = async () => {

    setError("");

    // CAPTCHA VALIDATION
    if (!captchaToken) {
      setError("Potwierdź CAPTCHA");
      return;
    }

    setLoading(true);

    try {

      const res = await axios.post(
        "http://localhost:8080/auth/login",
        {
          email,
          password,
          captchaToken,
        }
      );

      const token = res.data.token;
      const roles = res.data.roles;

      localStorage.setItem("token", token);

      // localStorage.setItem("roles", JSON.stringify(roles));

      // if (roles.includes("ADMIN")) navigate("/admin");
      // else navigate("/employee");

      navigate("/employee");

    } catch (err) {

      const message =
        err?.response?.data?.message ||
        "Błąd logowania";

      setError(message);

    } finally {

      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">

      <form
        className="auth-card"
        onSubmit={(e) => {
          e.preventDefault();
          login();
        }}
      >

        <div className="auth-header">
          <h1>Witaj ponownie</h1>
          <p>Zaloguj się do systemu</p>
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        {/* EMAIL */}
        <div className="auth-input-group">

          <label>Email</label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />

        </div>

        {/* PASSWORD */}
        <div className="auth-input-group">

          <label>Hasło</label>

          <div className="password-wrapper">

            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Ukryj" : "Pokaż"}
            </button>

          </div>
        </div>

        {/* CAPTCHA */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "20px",
            marginBottom: "20px",
          }}
        >

          <ReCAPTCHA
            sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
            onChange={(token) => setCaptchaToken(token)}
          />

        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          className="auth-button"
          disabled={loading}
        >
          {loading ? "Logowanie..." : "Zaloguj się"}
        </button>

        <div className="auth-footer">
          © 2026 BSK Jachimowicz, Kowalczyk
        </div>

      </form>
    </div>
  );
}