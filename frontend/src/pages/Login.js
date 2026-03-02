import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState('email'); // 'email' or 'phone'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const isAuthenticating = useRef(false);

  const { loginWithGoogle, loginWithApple, loginWithEmail, sendOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();

  const handleAction = async (actionFn, successMsg = 'Login successful!') => {
    setLoading(true);
    try {
      const result = await actionFn();
      if (result.success) {
        toast.success(successMsg);
        if (successMsg.includes('Login')) {
          navigate('/dashboard', { replace: true });
        }
      } else {
        toast.error(result.error || 'Operation failed');
      }
    } catch (error) {
      toast.error('Operation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (actionFn, providerName) => {
    // Prevent double clicks cancelling the popup request
    if (isAuthenticating.current) return;
    isAuthenticating.current = true;

    // We intentionally do NOT set loading to true here initially.
    // React state updates (re-renders) break the synchronous "user gesture" context
    // required by modern browsers to allow popups (like Google/Apple Sign in).
    const loadingToastId = toast.loading(`Connecting to ${providerName}...`);
    try {
      const result = await actionFn();
      if (result.success) {
        toast.update(loadingToastId, { render: `Successfully logged in with ${providerName}!`, type: "success", isLoading: false, autoClose: 3000 });
        navigate('/dashboard', { replace: true });
      } else {
        toast.update(loadingToastId, { render: result.error || `${providerName} login failed`, type: "error", isLoading: false, autoClose: 4000 });
      }
    } catch (error) {
      toast.update(loadingToastId, { render: `${providerName} login failed. Please try again.`, type: "error", isLoading: false, autoClose: 4000 });
    } finally {
      isAuthenticating.current = false;
    }
  };

  const onEmailLogin = (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please enter email and password');
    handleAction(() => loginWithEmail(email, password));
  };

  const onSendOtp = (e) => {
    e.preventDefault();
    if (!phone) return toast.error('Please enter a phone number');

    // Firebase requires E.164 format. Auto-prepend +91 for India if missing.
    let formattedPhone = phone.trim();
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+91' + formattedPhone;
    }

    handleAction(async () => {
      const result = await sendOtp(formattedPhone, 'recaptcha-container');
      if (result.success) {
        setPhone(formattedPhone);
        setOtpSent(true);
      }
      return result;
    }, 'OTP sent successfully!');
  };

  const onVerifyOtp = (e) => {
    e.preventDefault();
    if (!otp) return toast.error('Please enter the OTP');
    handleAction(() => verifyOtp(otp));
  };

  const buttonStyle = {
    width: '100%', padding: '12px 20px', display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: 12, borderRadius: 10, color: '#e2e8f0',
    fontSize: 16, fontWeight: 600, transition: 'all 0.2s ease', border: 'none',
  };

  const socialButtonStyle = {
    ...buttonStyle,
    background: loading ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)', cursor: loading ? 'wait' : 'pointer',
    opacity: loading ? 0.7 : 1,
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    background: loading ? '#4f46e5' : '#6366f1',
    cursor: loading ? 'wait' : 'pointer',
    opacity: loading ? 0.7 : 1, marginTop: 16
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: 8, background: 'rgba(0,0,0,0.2)',
    border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 16, marginBottom: 16,
    outline: 'none', transition: 'border-color 0.2s',
  };

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      minHeight: '100vh', background: 'linear-gradient(135deg, #0a0e1a 0%, #1a1f35 100%)',
    }}>
      <div style={{
        background: 'rgba(26, 31, 53, 0.95)', borderRadius: 16, padding: 40,
        width: 420, maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        border: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🏗️</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#818cf8', margin: 0 }}>SMTMS</h1>
          <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 8 }}>Smart Mining Transport Monitoring System</p>
        </div>

        {/* Auth Mode Toggle */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, background: 'rgba(0,0,0,0.2)', padding: 4, borderRadius: 10 }}>
          <button
            type="button"
            onClick={() => { setAuthMode('email'); setOtpSent(false); }}
            style={{
              flex: 1, padding: '8px', borderRadius: 8, border: 'none',
              background: authMode === 'email' ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: authMode === 'email' ? '#fff' : '#94a3b8',
              cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s'
            }}>
            Email
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('phone')}
            style={{
              flex: 1, padding: '8px', borderRadius: 8, border: 'none',
              background: authMode === 'phone' ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: authMode === 'phone' ? '#fff' : '#94a3b8',
              cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s'
            }}>
            Phone
          </button>
        </div>

        {authMode === 'email' ? (
          <form onSubmit={onEmailLogin}>
            <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} required />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} required />
            <button type="submit" disabled={loading} style={primaryButtonStyle}>
              {loading ? 'Processing...' : 'Sign In with Email'}
            </button>
          </form>
        ) : (
          <form onSubmit={otpSent ? onVerifyOtp : onSendOtp}>
            {!otpSent ? (
              <>
                <input type="tel" placeholder="Phone Number (e.g. +91...)" value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} required />
                <div id="recaptcha-container"></div>
                <button type="submit" disabled={loading} style={primaryButtonStyle}>
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </>
            ) : (
              <>
                <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 16 }}>OTP sent to {phone}</p>
                <input type="text" placeholder="Enter 6-digit OTP" value={otp} onChange={e => setOtp(e.target.value)} style={inputStyle} required />
                <button type="submit" disabled={loading} style={primaryButtonStyle}>
                  {loading ? 'Verifying...' : 'Verify & Login'}
                </button>
              </>
            )}
          </form>
        )}

        <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }}></div>
          <span style={{ margin: '0 16px', color: '#64748b', fontSize: 12 }}>OR CONTINUE WITH</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }}></div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            type="button"
            onClick={() => handleSocialLogin(loginWithGoogle, 'Google')}
            disabled={loading}
            style={socialButtonStyle}
            onMouseEnter={(e) => { if (!loading) { e.target.style.background = 'rgba(255,255,255,0.12)'; e.target.style.borderColor = 'rgba(129,140,248,0.4)'; } }}
            onMouseLeave={(e) => { if (!loading) { e.target.style.background = 'rgba(255,255,255,0.08)'; e.target.style.borderColor = 'rgba(255,255,255,0.15)'; } }}
          >
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            </svg>
            Google
          </button>

          <button
            type="button"
            onClick={() => handleSocialLogin(loginWithApple, 'Apple')}
            disabled={loading}
            style={socialButtonStyle}
            onMouseEnter={(e) => { if (!loading) { e.target.style.background = 'rgba(255,255,255,0.12)'; e.target.style.borderColor = 'rgba(129,140,248,0.4)'; } }}
            onMouseLeave={(e) => { if (!loading) { e.target.style.background = 'rgba(255,255,255,0.08)'; e.target.style.borderColor = 'rgba(255,255,255,0.15)'; } }}
          >
            <svg width="20" height="20" viewBox="0 0 384 512">
              <path fill="#ffffff" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
            </svg>
            Apple
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: '#64748b' }}>
          Authorized personnel only. Unauthorized access is prohibited.
        </p>
      </div>
    </div>
  );
};

export default Login;
