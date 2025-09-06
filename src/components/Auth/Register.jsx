import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { Pill, Lock, Mail, ArrowLeft, Shield, Zap, Eye, EyeOff, User, MapPin } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import {fetchRegister} from '../../api/auth';

// ✅ Reusable Input Component
const InputField = ({
  id,
  name,
  type = 'text',
  label,
  value,
  onChange,
  placeholder,
  icon: Icon,
  showToggle,
  showValue,
  onToggle
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
      )}
      <input
        id={id}
        name={name}
        type={showToggle ? (showValue ? 'text' : 'password') : type}
        required
        value={value}
        onChange={onChange}
        className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors duration-200"
        placeholder={placeholder}
      />
      {showToggle && (
        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
          onClick={onToggle}
        >
          {showValue ? <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" /> : <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />}
        </button>
      )}
    </div>
  </div>
);

const Register = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    city: '',
    role_id: 2
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mutation = useMutation({
    mutationFn: async (data) => {
      setIsSubmitting(true);
      return fetchRegister(data);
    },
    onSuccess: (res) => {
      console.log("Registration successful:", res);
      
      // Add a small delay to show the loading dots before navigation
      setTimeout(() => {
        navigate("/verify-code", { 
          state: { pending_user_id: res.pending_user_id , email: formData.email }, 
          replace: true 
        });
      }, 800);
    },
    onError: (err) => {
      setError(err.message || 'Registration failed. Please try again.');
      setIsSubmitting(false);
    },
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    // ✅ Gmail validation
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(formData.email)) {
      setError('Email must be a valid Gmail address');
      return;
    }

    mutation.mutate({
      full_name: formData.full_name,
      email: formData.email,
      password: formData.password,
      password_confirmation: formData.confirmPassword,
      city: formData.city,
      role_id: formData.role_id
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-72 h-72 bg-teal-100 rounded-full -translate-x-40 -translate-y-40 opacity-40"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-100 rounded-full translate-x-40 translate-y-40 opacity-40"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-blue-100 rounded-full opacity-30"></div>
      </div>

      {/* Pills Pattern */}
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
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h2>
          <p className="text-gray-600">Join Parasaffona today</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center">
                  <Shield className="h-4 w-4 mr-2 flex-shrink-0" />
                  {error}
                </div>
              )}

              <InputField
                id="full_name"
                name="full_name"
                label="Full Name"
                placeholder="Enter your full name"
                value={formData.full_name}
                onChange={handleChange}
                icon={User}
              />

              <InputField
                id="email"
                name="email"
                type="email"
                label="Email Address"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                icon={Mail}
              />

              <InputField
                id="city"
                name="city"
                label="City"
                placeholder="Enter your city"
                value={formData.city}
                onChange={handleChange}
                icon={MapPin}
              />

              <InputField
                id="password"
                name="password"
                label="Password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                icon={Lock}
                showToggle
                showValue={showPassword}
                onToggle={() => setShowPassword(!showPassword)}
              />

              <InputField
                id="confirmPassword"
                name="confirmPassword"
                label="Confirm Password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                icon={Lock}
                showToggle
                showValue={showConfirmPassword}
                onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
              />

              {/* Terms */}
              {/* <div className="flex items-center">
                <input id="terms" name="terms" type="checkbox" required className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded" />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                  I agree to the <a href="#" className="font-medium text-teal-700 hover:text-teal-900">Terms of Service</a> and <a href="#" className="font-medium text-teal-700 hover:text-teal-900">Privacy Policy</a>
                </label>
              </div> */}

              {/* Submit Button with Dots Loader */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="flex space-x-1 mr-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    Creating account...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Zap className="h-4 w-4 mr-2" />
                    Create Account
                  </div>
                )}
              </button>
            </form>
          </div>

          {/* Login Redirect */}
          <div className="bg-gray-50 px-6 py-4 sm:px-8 sm:py-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-teal-700 hover:text-teal-900">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Parasaffona. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;