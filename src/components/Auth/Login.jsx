import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useLanguage } from '../../contexts/LanguageContext';
import { Pill, Lock, Mail, ArrowLeft, Sparkles, Shield, Zap, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { login, me } from '../../api/auth';

const Login = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loggedIn, setLoggedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Validation rules
  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!credentials.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(credentials.email)) {
      newErrors.email = 'Invalid email address';
    }
    
    // Password validation
    if (!credentials.password) {
      newErrors.password = 'Password is required';
    } else if (credentials.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate on input change when field has been touched
  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      validateForm();
    }
  }, [credentials, touched]);

  // Login mutation
  const mutation = useMutation({
    mutationFn: ({ email, password }) => login(email, password),
    onSuccess: () => {
      setLoggedIn(true); // trigger user fetch
    },
    onError: (err) => {
      setErrors({ submit: err.message || 'Login failed. Please try again.' });
    },
  });

  // Fetch current user after login
  const { data: userData, isLoading, isError, error: userError } = useQuery({
    queryKey: ['user'],
    queryFn: me,
    enabled: loggedIn, // fetch only after login
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  // Redirect once user data is available
  useEffect(() => {
    if (userData) {
      localStorage.setItem('islogged', 'true');
      if (userData.role_id == '1') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    }
  }, [userData, navigate]);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    // Clear error for this field when user starts typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleBlur = (e) => {
    setTouched({ ...touched, [e.target.name]: true });
    validateForm();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Mark all fields as touched to show all errors
    setTouched({
      email: true,
      password: true
    });
    
    // Validate form before submission
    if (validateForm()) {
      setErrors({});
      mutation.mutate(credentials);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-72 h-72 bg-teal-100 rounded-full -translate-x-40 -translate-y-40 opacity-40"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-100 rounded-full translate-x-40 translate-y-40 opacity-40"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-blue-100 rounded-full opacity-30"></div>
      </div>

      {/* Medical pattern */}
      <div className="absolute inset-0 opacity-5">
        {[...Array(25)].map((_, i) => (
          <div key={i} className="absolute text-teal-500" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            transform: `scale(${0.5 + Math.random() * 0.5}) rotate(${Math.random() * 360}deg)`
          }}>
            <Pill size={28} />
          </div>
        ))}
      </div>

      <div className="max-w-md w-full space-y-6 relative z-10">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center text-teal-700 hover:text-teal-900 mb-6 group transition-colors font-medium">
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-teal-700 rounded-2xl blur opacity-60"></div>
              <div className="relative bg-white p-4 rounded-2xl shadow-lg border border-teal-100">
                <div className="bg-gradient-to-br from-teal-600 to-teal-800 p-3 rounded-xl">
                  <Pill className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Login</h2>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center">
                  <Shield className="h-4 w-4 mr-2 flex-shrink-0" />
                  {errors.submit}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
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
                    value={credentials.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`block w-full pl-10 pr-3 py-3 border ${errors.email && touched.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors duration-200`}
                    placeholder="Enter your email"
                    disabled={mutation.isLoading}
                  />
                  {errors.email && touched.email && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                </div>
                {errors.email && touched.email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={credentials.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`block w-full pl-10 pr-10 py-3 border ${errors.password && touched.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors duration-200`}
                    placeholder="Enter your password"
                    disabled={mutation.isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={mutation.isLoading}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" /> : <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />}
                  </button>
                  {errors.password && touched.password && (
                    <div className="absolute inset-y-0 right-8 pr-3 flex items-center pointer-events-none">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                </div>
                {errors.password && touched.password && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <Link to="/verify-gmail" className="font-medium text-teal-700 hover:text-teal-900">Forgot password?</Link>
                </div>
              </div>

              <button
                type="submit"
                disabled={mutation.isLoading || Object.keys(errors).length > 0}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {mutation.isLoading ? (
                  <div className="flex items-center">
                    <div className="flex space-x-1 mr-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Zap className="h-4 w-4 mr-2" />
                    Sign in
                  </div>
                )}
              </button>

              {/* Register Redirect */}
              <div className="bg-gray-50 px-6 py-4 sm:px-8 sm:py-6 border-t border-gray-200 text-center">
                <p className="text-sm text-gray-600">
                  create new account{' '}
                  <Link to="/register" className="font-medium text-teal-700 hover:text-teal-900">Register</Link>
                </p>
              </div>
            </form>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">© {new Date().getFullYear()} Parasaffona. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;