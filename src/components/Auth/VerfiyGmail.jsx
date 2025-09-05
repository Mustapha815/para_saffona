import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Pill, Mail, ArrowLeft, Shield, CheckCircle, Zap } from "lucide-react";
import { forgotPassword } from "../../api/auth";
import { useMutation } from "@tanstack/react-query";

const VerfiyGmail = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // useMutation
  const mutation = useMutation({
    mutationFn: (email) => {
      setLoading(true);
      return forgotPassword(email);
    },
    onSuccess: (res) => {
      console.log("Forgot response:", res);
      setLoading(false);
      // navigate with user_id
      navigate("/verify-code", { 
        state: { user_id: res.user_id, email: email }, 
        replace: true 
      });    
    },
    onError: (err) => {
      console.error(err);
      setError(err.message || "Failed to send reset instructions");
      setLoading(false);
    },
  });

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setError("");
    mutation.mutate(email);
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
              transform: `scale(${0.5 + Math.random() * 0.5}) rotate(${
                Math.random() * 360
              }deg)`,
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
                  <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            Reset Password
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Enter your email to reset your password
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-4 sm:p-6 md:p-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 sm:px-4 sm:py-3 rounded-lg text-xs sm:text-sm mb-4">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-3 py-2 sm:px-4 sm:py-3 rounded-lg text-xs sm:text-sm mb-4">
                Reset code sent to your email
              </div>
            )}

            <form onSubmit={handleEmailSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors duration-200"
                    placeholder="Enter your email"
                    disabled={loading}
                  />
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
                    Sending...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Zap className="h-4 w-4 mr-2" />
                    Send Reset Instructions
                  </div>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Parasaffona. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerfiyGmail;