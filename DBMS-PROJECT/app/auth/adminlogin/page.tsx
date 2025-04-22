"use client"
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    adminId: '',
    password: '',
    adminType: 'administrator' // Default admin type
  });
  const [adminIdError, setAdminIdError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validate admin ID length
    if (name === 'adminId') {
      if (value.length !== 4 && value.length !== 6) {
        setAdminIdError('Admin ID must be exactly 4 or 6 characters');
      } else if (!/^[A-Za-z0-9]{4,6}$/.test(value)) {
        setAdminIdError('Admin ID can only contain letters and numbers');
      } else {
        setAdminIdError('');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const adminInfo = localStorage.getItem('adminInfo');
    const parsedAdminInfo = JSON.parse(adminInfo || '{}');
    console.log(parsedAdminInfo.admin_login_id, formData.adminId, 'parsedAdminInfo');
    if (adminInfo) {
      if(parsedAdminInfo.admin_login_id === formData.adminId) {
      alert('Admin already logged in');
      router.push('/admin/admininfo');
      return;
    }
    else {
      alert("one account already in use");
      return;
    }
  }
    
    // Validate admin ID before submission
    if (formData.adminId.length !== 4 && formData.adminId.length !== 6) {
      setAdminIdError('Admin ID must be exactly 4 or 6 characters');
      return;
    }
    if (!/^[A-Za-z0-9]{4,6}$/.test(formData.adminId)) {
      setAdminIdError('Admin ID can only contain letters and numbers');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        role: 'admin',
        identifier: formData.adminId,
        loginMethod: `adminId_${formData.adminType}`,
        password: formData.password,
        adminType: formData.adminType,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid admin ID or password');
        console.log(result);
        return;
      }
      else {
        try {
          const response = await fetch('/api/getpatient', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          const data = await response.json();
          console.log(data, "data");
          localStorage.setItem('adminInfo', JSON.stringify(data.user));
        } catch (error) {
          console.log(error, "error");
        }
        
        router.push('/admin/admininfo');
        console.log(result);
      }

      // Successful login
    } catch (error) {
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-800 mb-2">
            👨‍⚕️ Admin Login
          </h1>
          <p className="text-gray-600">
            Please enter your admin credentials to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Admin Type */}
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="adminType">
              👤 Admin Type
            </label>
            <select
              id="adminType"
              name="adminType"
              value={formData.adminType}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="administrator">Administrator</option>
              <option value="labAssistant">Lab Assistant</option>
              <option value="pharmacist">Pharmacist</option>
            </select>
          </div>

          {/* Admin ID */}
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="adminId">
              🔑 Admin ID
            </label>
            <input
              type="text"
              id="adminId"
              name="adminId"
              value={formData.adminId}
              onChange={handleChange}
              required
              maxLength={6}
              minLength={4}
              pattern="[A-Za-z0-9]{4,6}"
              className={`w-full p-3 border ${
                adminIdError ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              placeholder="Enter 4 or 6-character admin ID"
            />
            {adminIdError && (
              <p className="text-sm text-red-500 mt-1 flex items-center">
                <span className="mr-1">⚠️</span>
                {adminIdError}
              </p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Must be exactly 4 or 6 characters (letters and numbers only)
            </p>
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="password">
              🔒 Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm flex items-center">
              <span className="mr-2">⚠️</span>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !!adminIdError}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <Link href="/" className="text-blue-600 hover:text-blue-800 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}