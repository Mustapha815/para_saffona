import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Pill, ArrowLeft, Shield, CheckCircle, Zap, Clock } from 'lucide-react';
import { forgotPassword, verifyEmail, verifyUser } from '../../api/auth'; // ensure correct path

const VerifyCode = () => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  const location = useLocation();
  const navigate = useNavigate();
  const user_id = location.state?.user_id;
  const pending_user_id = location.state?.pending_user_id;
  const email = location.state?.email || '';

  // Screen resize handler
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // React Query mutation
  const mutation = useMutation({
    mutationFn: async (verificationData) => {
      setLoading(true);
      if (pending_user_id) {
        return verifyEmail(verificationData); // email verification
      } else if (user_id) {
        return verifyUser(verificationData); // user verification
      } else {
        throw new Error("No user_id or pending_user_id found");
      }
    },
    onSuccess: (data) => {
      console.log('Verified:', data);
      setLoading(false);
      if (pending_user_id) {
        navigate('/login');
      } else if (user_id) {
        navigate('/change-password', { 
          state: {email: email}, 
          replace: true 
        });
      } else {
        throw new Error("No user_id or pending_user_id found");
      }
    },
    onError: (err) => {
      setError(err.message || 'Verification failed.');
      setLoading(false);
    },
  });

  // Input change handler
  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      document.getElementById(`code-${index + 1}`)?.focus();
    }
    if (error) setError('');
  };

  // Keyboard navigation
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      document.getElementById(`code-${index - 1}`)?.focus();
    }
  };

  // Paste handler
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    if (/^\d{6}$/.test(pastedData)) {
      setCode(pastedData.split(''));
      document.getElementById('code-5')?.focus();
    }
  };

  // Submit verification
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (code.some((digit) => digit === '')) {
      setError('Please enter the full verification code');
      return;
    }

    const verificationCode = code.join('');

    if (pending_user_id) {
      mutation.mutate({ pending_user_id, code: verificationCode });
    } else if (user_id) {
      mutation.mutate({ user_id, code: verificationCode });
    } else {
      setError("No user found for verification.");
    }
  };

  // Resend code
// state

// effect لتشغيل العد التنازلي
useEffect(() => {
  if (countdown <= 0) return;

  const timer = setTimeout(() => {
    setCountdown(countdown - 1);
  }, 1000);

  return () => clearTimeout(timer);
}, [countdown]);

// resend code function
const handleResendCode = async () => {
  if (!email) return;

  setError('');
  setLoading(true);

  try {
   await forgotPassword(email);
   setCountdown(30); 
  } catch (err) {
    setError(err.message || 'Failed to resend code.');
    setCountdown(0);
  } finally {
    setLoading(false);
  }
};



  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 flex items-center justify-center py-4 px-3 sm:py-8 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-48 h-48 sm:w-72 sm:h-72 bg-teal-100 rounded-full -translate-x-1/3 -translate-y-1/3 sm:-translate-x-40 sm:-translate-y-40 opacity-40"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-cyan-100 rounded-full translate-x-1/3 translate-y-1/3 sm:translate-x-40 sm:translate-y-40 opacity-40"></div>
        <div className="absolute top-1/3 right-1/4 w-40 h-40 sm:w-64 sm:h-64 bg-blue-100 rounded-full opacity-30"></div>
      </div>

      {/* Code Inputs */}
      <div className="max-w-md w-full space-y-4 sm:space-y-6 relative z-10 mx-2">
        <div className="text-center">
          <button onClick={() => navigate(-1)} className="inline-flex items-center text-teal-700 hover:text-teal-900 mb-4 sm:mb-6">
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            Back
          </button>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Verification Code</h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Enter the 6-digit code sent to your {email}
          </p>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-4 sm:p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 sm:px-4 sm:py-3 rounded-lg text-xs sm:text-sm">
                  {error}
                </div>
              )}

              <div className="flex justify-between space-x-2 sm:space-x-3">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    id={`code-${index}`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-10 h-10 sm:w-12 sm:h-12 text-center text-lg sm:text-xl font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    autoFocus={index === 0}
                    disabled={loading}
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading || mutation.isLoading}
                className="w-full flex justify-center items-center py-2 sm:py-3 px-4 rounded-lg text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading || mutation.isLoading ? (
                  <div className="flex items-center">
                    <div className="flex space-x-1 mr-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    Verifying...
                  </div>
                ) : (
                  'Verify Code'
                )}
              </button>

              <div className="text-center pt-3 sm:pt-4 border-t border-gray-200">
                <p className="text-xs sm:text-sm text-gray-600">
                  Didn't receive the code?{' '}
                  {countdown > 0 ? (
                    <span className="text-gray-500">
                      Resend in <Clock className="h-3 w-3 inline mb-0.5" /> {countdown}s
                    </span>
                  ) : (
                    <button type="button" onClick={handleResendCode} disabled={loading} className="font-medium text-teal-700 hover:text-teal-900">
                      Resend code
                    </button>
                  )}
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyCode;