"use client"
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DoctorLogin() {
  const router = useRouter();
  const [loginId, setLoginId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    doctorId: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if(name === 'doctorId') {
      setLoginId(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const doctorInfo = localStorage.getItem('doctorInfo');
    const parsedDoctorInfo = JSON.parse(doctorInfo || '{}');
    console.log(parsedDoctorInfo, 'parsedDoctorInfo');
    console.log(parsedDoctorInfo.doctor_login_id, loginId, 'parsedDoctorInfo');
    if (doctorInfo) {
      if(parsedDoctorInfo.login_id === loginId) {
        alert('Doctor already logged in');
        router.push('/doctor/doctorinfo');
        return;
      }
      else {
        alert("One account already in use");
        return;
      }
    }
    
    setLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        role: 'doctor',
        identifier: formData.doctorId,
        loginMethod: 'doctorId',
        password: formData.password,
        redirect: false,
      });

      if(res?.error) {
        console.log(res, "its error");
        setError("Invalid credentials");
      }
      else  {
        router.push('/doctor/doctorinfo');
      }

      // Successful login
     
    } catch (error) {
        console.log(error, "its error");
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-100 to-blue-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-800 mb-2">
            👨‍⚕️ Doctor Login
          </h1>
          <p className="text-gray-600">
            Please enter your doctor credentials to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Doctor ID */}
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="doctorId">
              🔑 Doctor ID
            </label>
            <input
              type="text"
              id="doctorId"
              name="doctorId"
              value={formData.doctorId}
              onChange={handleChange}
              required
              maxLength={6}
              pattern="[A-Za-z0-9]{6}"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter 6-character doctor ID"
            />
            <p className="text-sm text-gray-500 mt-1">
              Must be exactly 6 characters (letters and numbers only)
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
              minLength={6}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span>
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <Link href="/" className="text-green-600 hover:text-green-800 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}