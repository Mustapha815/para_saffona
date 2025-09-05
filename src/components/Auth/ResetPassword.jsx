import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Pill, ArrowLeft, Shield, CheckCircle, Eye, EyeOff, Lock } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { update_password } from '../../api/auth'; // تأكد path ديال api

const ResetPassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || 'user@example.com';

  const mutation = useMutation({
    mutationFn: (resetdata) => {
      setLoading(true);
      return update_password(resetdata);
    },
    onSuccess: () => {
      setSuccess(true);
      setLoading(false);
      setTimeout(() => navigate('/login'), 3000);
    },
    onError: (err) => {
      setError(err.message || err?.message || 'فشل تحديث الباسورد');
      setLoading(false);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('يرجى ملء جميع الحقول');
      return;
    }

    if (newPassword.length < 8) {
      setError('الباسورد الجديد يجب أن يكون 8 حروف على الأقل');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('تأكيد الباسورد لا يتطابق');
      return;
    }
    const newPassData= {
      old_password: currentPassword,
      new_password: newPassword,
      new_password_confirmation: confirmPassword,
    }
    mutation.mutate(newPassData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 flex items-center justify-center py-4 px-3 sm:py-8 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-48 h-48 sm:w-72 sm:h-72 bg-teal-100 rounded-full -translate-x-1/3 -translate-y-1/3 sm:-translate-x-40 sm:-translate-y-40 opacity-40"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-cyan-100 rounded-full translate-x-1/3 translate-y-1/3 sm:translate-x-40 sm:translate-y-40 opacity-40"></div>
        <div className="absolute top-1/3 right-1/4 w-40 h-40 sm:w-64 sm:h-64 bg-blue-100 rounded-full opacity-30"></div>
      </div>

      {/* Medical pattern */}
      <div className="absolute inset-0 opacity-5">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute text-teal-500"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              transform: `scale(${0.5 + Math.random() * 0.5}) rotate(${Math.random() * 360}deg)`,
            }}
          >
            <Pill size={24} />
          </div>
        ))}
      </div>

      <div className="max-w-md w-full space-y-4 sm:space-y-6 relative z-10 mx-2">
        {/* Header */}
        <div className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center text-teal-700 hover:text-teal-900 mb-4 sm:mb-6 group transition-colors font-medium text-sm sm:text-base"
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Login
          </Link>

          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl sm:rounded-2xl blur opacity-60"></div>
              <div className="relative bg-white p-2 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg border border-teal-100">
                <div className="bg-gradient-to-br from-teal-600 to-teal-800 p-2 sm:p-3 rounded-lg sm:rounded-xl">
                  <Lock className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Reset Password</h2>
          <p className="text-gray-600 text-sm sm:text-base">
            {success
              ? 'تم تحديث الباسورد بنجاح! سيتم تحويلك لتسجيل الدخول...'
              : `Create a new password for ${email}`}
          </p>
        </div>

        {/* Form or Success Message */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-4 sm:p-6 md:p-8">
            {success ? (
              <div className="text-center space-y-4 sm:space-y-6">
                <div className="flex justify-center">
                  <div className="bg-teal-100 p-3 sm:p-4 rounded-full">
                    <CheckCircle className="h-8 w-8 sm:h-12 sm:w-12 text-teal-600" />
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 sm:px-4 sm:py-3 rounded-lg text-xs sm:text-sm">
                    {error}
                  </div>
                )}

                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors duration-200"
                      placeholder="Enter your current password"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      disabled={loading}
                    >
                      {showCurrentPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors duration-200"
                      placeholder="Enter your new password"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      disabled={loading}
                    >
                      {showNewPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters long</p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors duration-200"
                      placeholder="Confirm your new password"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={loading}
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-2 sm:py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="flex space-x-1 mr-2">
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      Resetting...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Lock className="h-4 w-4 mr-2" />
                      Reset Password
                    </div>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;