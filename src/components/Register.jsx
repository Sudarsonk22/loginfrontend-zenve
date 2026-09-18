import { useState } from 'react'
import './Register.css'
import { useNavigate } from 'react-router-dom';

function RegisterForm(){
    const navigate = useNavigate();
    const [data,setData]= useState({
        fullName: "",
        email:"",
        phoneNumber:"",
        otp: "",
        passWord: "",
        confirmPassword: "",
        whatsappOptIn: false
    });
    const [error,setError]= useState({ })
    const [submitting, setSubmitting] = useState(false);

    const [otpSent, setOtpSent] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);
    const [devOtp, setDevOtp] = useState(null);
    const [resendMsg, setResendMsg] = useState("");
    const [cooldown, setCooldown] = useState(0);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[6-9]\d{9}$/;

    const handleChange=(e)=>{
        const {name,value,type,checked}= e.target;
        setData({
            ...data,
            [name]: type === 'checkbox' ? checked : value
        })
    }

    const handleGenerateOtp = async () => {
        let newError = {};
        if(data.fullName.trim() === "") newError.fullName = "Full Name is required";
        else if(data.fullName.length < 3) newError.fullName = "fullName must be at least 3 characters";

        if(data.email.trim() === "") newError.email = "Email is required";
        else if(!emailRegex.test(data.email)) newError.email = "Enter the valid email";

        if(data.phoneNumber.trim() === "") newError.phoneNumber = "Enter your phone number";
        else if(!phoneRegex.test(data.phoneNumber)) newError.phoneNumber = "Enter your vaild phone number";

        if(data.passWord.trim() === "") newError.passWord = "Password is required";
        else if(data.passWord.length < 6) newError.passWord = "Password must be at least 6 characters";

        if(data.confirmPassword.trim() === "") newError.confirmPassword = "Confirm Password is required";
        else if(data.passWord !== data.confirmPassword) newError.confirmPassword = "Password does not match";

        setError(newError);
        if(Object.keys(newError).length !== 0) return;

        setSendingOtp(true);
        try {
            const response = await fetch("http://localhost:8080/api/auth/register/initiate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fullName: data.fullName,
                    email: data.email,
                    phoneNumber: data.phoneNumber,
                    password: data.passWord,
                    whatsappOptIn: data.whatsappOptIn
                })
            });
            const result = await response.json();

            if (result.success) {
                setDevOtp(result.data);
                setOtpSent(true);
                setCooldown(30);
                const timer = setInterval(() => {
                    setCooldown((prev) => {
                        if (prev <= 1) { clearInterval(timer); return 0; }
                        return prev - 1;
                    });
                }, 1000);
            } else {
                setError({ submit: result.message });
            }
        } catch (err) {
            setError({ submit: "Could not reach the server. Please try again." });
        } finally {
            setSendingOtp(false);
        }
    }

    const handleResend = async () => {
        setResendMsg("");
        try {
            const response = await fetch("http://localhost:8080/api/auth/register/resend-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phoneNumber: data.phoneNumber })
            });
            const result = await response.json();
            if (result.success) {
                setResendMsg("A new OTP has been sent.");
                setDevOtp(result.data);
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!otpSent) {
            setError({ submit: "Please generate the OTP first." });
            return;
        }
        if (data.otp.trim() === "") {
            setError({ otp: "Enter the OTP sent to your phone" });
            return;
        }

        setSubmitting(true);
        setError({});
        try {
            const response = await fetch("http://localhost:8080/api/auth/register/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phoneNumber: data.phoneNumber, otp: data.otp })
            });
            const result = await response.json();

            if (result.success) {
                alert("Account created successfully! Please log in.");
                navigate("/login");
            } else {
                setError({ otp: result.message });
            }
        } catch (err) {
            setError({ otp: "Could not reach the server. Please try again." });
        } finally {
            setSubmitting(false);
        }
    }

    return(
        <div className="reg-page">
            <div className="reg-wrapper">

                <div className="reg-left">
                    <div className="reg-brand">
                        <div className="reg-brand-mark">
                            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 21c-3.5-3.2-8-6.1-8-10a4 4 0 0 1 8-1 4 4 0 0 1 8 1c0 3.9-4.5 6.8-8 10z"/></svg>
                        </div>
                        <div>
                            <div className="reg-brand-name">Zenve Doctors</div>
                            
                        </div>
                    </div>
                    <h1 className="reg-headline">Create your Zenve Doctors account</h1>
                    <p className="reg-sub">Join the clinics managing appointments, prescriptions and records from one simple dashboard.</p>
                    <div className="reg-illustration">
                        <img src="/dog-cat.png" alt="Dog and cat" />
                    </div>
                </div>

                <div className="reg-card">
                    <div className="reg-card-header">
                        <div className="reg-card-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        </div>
                        <h2 className="reg-card-title">User Registration</h2>
                    </div>
                    <p className="reg-card-sub">Fill in the details below to get started.</p>

                    <form onSubmit={handleSubmit}>
                        <div className='form-group'>
                            <label>Full Name</label>
                            <input type='text' name='fullName' value={data.fullName}
                            placeholder='Enter your Full Name' onChange={handleChange} disabled={otpSent}/>
                            {error.fullName && (<p>{error.fullName}</p>)}
                        </div>

                        <div className='form-group'>
                            <label>Email</label>
                            <input type='email' name='email' value={data.email}
                            placeholder='you@example.com' onChange={handleChange} disabled={otpSent}/>
                            {error.email &&(<p>{error.email}</p>)}
                        </div>

                        <div className='form-group'>
                            <label>Phone Number</label>
                            <div style={{display:'flex', gap:'8px'}}>
                                <input type='text' name='phoneNumber' value={data.phoneNumber}
                                placeholder='Enter your Phone Number' onChange={handleChange} disabled={otpSent}
                                style={{flex:1}}/>
                                <button type="button" onClick={handleGenerateOtp} disabled={sendingOtp || otpSent}
                                    style={{whiteSpace:'nowrap', padding:'0 14px', borderRadius:'10px', border:'1.5px solid #3F6B4A',
                                    background: otpSent ? '#E4EEE0' : '#fff', color:'#2E4E36', fontWeight:600, fontSize:'13px', cursor: otpSent ? 'default' : 'pointer'}}>
                                    {otpSent ? "OTP Sent" : (sendingOtp ? "Sending..." : "Generate OTP")}
                                </button>
                            </div>
                            {error.phoneNumber && (<p>{error.phoneNumber}</p>)}
                        </div>

                        <div className='form-group'>
                            <label>6-digit OTP</label>
                            <input type='text' name='otp' value={data.otp} onChange={handleChange}
                            placeholder={otpSent ? 'Enter the OTP' : 'Generate OTP first'} maxLength="6" disabled={!otpSent}/>
                            {error.otp && <p>{error.otp}</p>}
                            {devOtp && <p style={{color:'#2E4E36', fontWeight:600}}>Dev mode — your OTP is: {devOtp}</p>}
                            {otpSent && (
                                <button type="button" onClick={handleResend} disabled={cooldown>0}
                                    style={{marginTop:'4px', background:'none', border:'none', color: cooldown>0 ? '#B3B8AE' : '#2E4E36', fontWeight:600, cursor: cooldown>0 ? 'not-allowed':'pointer', fontSize:'12.5px', padding:0}}>
                                    {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
                                </button>
                            )}
                            {resendMsg && <p>{resendMsg}</p>}
                        </div>

                        <div className='form-group'>
                            <label>Password</label>
                            <input type='password' name='passWord' value={data.passWord}
                            placeholder='Min. 6 characters' onChange={handleChange} disabled={otpSent}/>
                            {error.passWord &&(<p>{error.passWord}</p>)}
                        </div>

                        <div className='form-group'>
                            <label>Confirm Password</label>
                            <input type='password' name='confirmPassword' value={data.confirmPassword}
                            placeholder='Re-enter your password' onChange={handleChange} disabled={otpSent}/>
                            {error.confirmPassword && ( <p>{error.confirmPassword}</p>)}
                        </div>

                        <div className='form-group'>
                            <label className="checkbox-label">
                                <input type='checkbox' name='whatsappOptIn' checked={data.whatsappOptIn} onChange={handleChange} disabled={otpSent}/>
                                Receive appointment updates on WhatsApp
                            </label>
                        </div>

                        <button type='submit' className='submit' disabled={submitting || !otpSent}>
                            {submitting ? "Verifying..." : "Create Account"}
                        </button>
                        {error.submit && <p>{error.submit}</p>}

                        <div className="reg-login-link">
                            Already have an account? <a href="/login">Login</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
export default RegisterForm;