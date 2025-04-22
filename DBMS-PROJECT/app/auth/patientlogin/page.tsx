'use client'
import React, { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const LoginPage: React.FC = () => {
  const [loginMethod, setLoginMethod] = useState("email");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [loginId, setLoginId] = useState('');

  useEffect(() => {
    if (loginMethod === 'email') {
      setLoginId(identifier);
    } else {
      setLoginId(identifier);
    }
  }, [identifier, loginMethod]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const patientInfo = localStorage.getItem('patientInfo');
    const parsedPatientInfo = JSON.parse(patientInfo || '{}');
    console.log(parsedPatientInfo, 'parsedPatientInfo');
    
    if (patientInfo) {
      if (parsedPatientInfo.email_id === identifier || parsedPatientInfo.phone === identifier) {
        alert('Patient already logged in');
        router.push('/patient/patientinfo');
        return;
      } else {
        alert("One account already in use");
        return;
      }
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const res = await signIn('credentials', {
        redirect: false,
        role: 'patient',
        identifier,
        loginMethod,
        password,
      });

      if (res?.error) {
        switch (res.error) {
          case "CredentialsSignin":
            setError("Invalid email/phone or password");
            break;
          case "AccessDenied":
            setError("Access denied. Please check your credentials.");
            break;
          default:
            setError("An error occurred during login. Please try again.");
        }
      } else if (res?.ok) {
        router.push('/patient/patientinfo');
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 transform transition-all duration-300 hover:shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">👤</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Please sign in to your account</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg animate-shake">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-xl">⚠️</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <label
                htmlFor="loginMethod"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                <span className="flex items-center">
                  <span className="mr-2">🔑</span>
                  Login Method
                </span>
              </label>
              <select
                id="loginMethod"
                value={loginMethod}
                onChange={(e) => {
                  setLoginMethod(e.target.value);
                  setError(null);
                  setIdentifier("");
                }}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              >
                <option value="email">Email</option>
                <option value="phone">Phone Number</option>
              </select>
            </div>

            <div className="relative">
              <label
                htmlFor="identifier"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                <span className="flex items-center">
                  <span className="mr-2">{loginMethod === 'email' ? '📧' : '📱'}</span>
                  {loginMethod === 'email' ? 'Email Address' : 'Phone Number'}
                </span>
              </label>
              <input
                type={loginMethod === 'email' ? 'email' : 'tel'}
                id="identifier"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  setError(null);
                }}
                placeholder={loginMethod === 'email' ? 'Enter your email' : 'Enter your phone number'}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              />
            </div>

            <div className="relative">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                <span className="flex items-center">
                  <span className="mr-2">🔒</span>
                  Password
                </span>
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg shadow-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-8 text-center space-y-4">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link 
                href="/patientform" 
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition duration-200"
              >
                Register here
              </Link>
            </p>
            <Link 
              href="/" 
              className="inline-flex items-center text-gray-500 hover:text-gray-600 transition duration-200"
            >
              <span className="mr-1">←</span>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;