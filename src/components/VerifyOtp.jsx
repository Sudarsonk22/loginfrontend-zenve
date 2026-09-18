import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

function VerifyOtp() {
    const navigate = useNavigate();
    const location = useLocation();
    const phoneNumber = location.state?.phoneNumber;
    const devOtp = location.state?.devOtp;

    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [resendMsg, setResendMsg] = useState("");
    const [cooldown, setCooldown] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [currentDevOtp, setCurrentDevOtp] = useState(devOtp);

    const handleVerify = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");
        try {
            const response = await fetch("http://localhost:8080/api/auth/register/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phoneNumber, otp })
            });
            const result = await response.json();

            if (result.success) {
                localStorage.setItem("token", result.data.token);
                navigate("/dashboard");
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError("Could not reach the server. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    const handleResend = async () => {
        setResendMsg("");
        try {
            const response = await fetch("http://localhost:8080/api/auth/register/resend-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phoneNumber })
            });
            const result = await response.json();

            if (result.success) {
                setResendMsg("A new OTP has been sent.");
                setCurrentDevOtp(result.data);
                setCooldown(30);
                const timer = setInterval(() => {
                    setCooldown((prev) => {
                        if (prev <= 1) { clearInterval(timer); return 0; }
                        return prev - 1;
                    });
                }, 1000);
            } else {
                setResendMsg(result.message);
            }
        } catch (err) {
            setResendMsg("Could not reach the server. Please try again.");
        }
    }

    return (
        <div>
            <h1>Verify OTP</h1>
            <p>Enter the code sent to {phoneNumber}</p>
            {currentDevOtp && <p style={{color: 'green'}}>  your OTP is: {currentDevOtp}</p>}
            <form onSubmit={handleVerify}>
                <input type='text' value={otp} onChange={(e) => setOtp(e.target.value)} placeholder='6-digit OTP' />
                {error && <p>{error}</p>}
                <button type='submit' disabled={submitting}>{submitting ? "Verifying..." : "Verify"}</button>
            </form>

            <button onClick={handleResend} disabled={cooldown > 0}>
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
            </button>
            {resendMsg && <p>{resendMsg}</p>}
        </div>
    )
}
export default VerifyOtp;