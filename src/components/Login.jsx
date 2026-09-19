import "./Login.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [data, setData] = useState({
    email: "",
    password: ""
  });

  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let newError = {};

    if (data.email.trim() === "") {
      newError.email = "Email is required";
    } else if (!emailRegex.test(data.email)) {
      newError.email = "Enter a valid email";
    }

    if (data.password.trim() === "") {
      newError.password = "Password is required";
    }

    setError(newError);
    if (Object.keys(newError).length !== 0) return;

    try {
      setLoading(true);
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, password: data.password })
      });
      const result = await response.json();

      if (result.success) {
        localStorage.setItem("token", result.data.token);
        navigate("/dashboard");
      } else {
        setError({ submit: result.message });
      }
    } catch (err) {
      setError({ submit: "Could not reach the server. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-brand-mark">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 21c-3.5-3.2-8-6.1-8-10a4 4 0 0 1 8-1 4 4 0 0 1 8 1c0 3.9-4.5 6.8-8 10z"/></svg>
          </div>
          <div className="login-brand-name">Zenve Doctors</div>
        </div>

        <h2 className="login-title">Welcome back</h2>
        <p className="login-sub">Sign in to your account to continue.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 6 10-6"/></svg>
              Email
            </label>
            <input
              type="email"
              name="email"
              value={data.email}
              onChange={handleChange}
              placeholder="you@example.com"
            />
            {error.email && <p>{error.email}</p>}
          </div>

          <div className="form-group">
            <label>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Password
            </label>
            <div style={{position:'relative'}}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={data.password}
                onChange={handleChange}
                placeholder="Enter your password"
                style={{paddingRight:'40px'}}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#8A968C', padding:0}}>
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.94 10.94 0 0112 20c-7 0-11-8-11-8a18.5 18.5 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
            {error.password && <p>{error.password}</p>}
          </div>

          <button type="submit" className="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
          {error.submit && <p>{error.submit}</p>}

          <div className="login-register-link">
            Don't have an account? <a href="/">Register</a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;