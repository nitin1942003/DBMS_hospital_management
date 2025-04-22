// pages/patient.js
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/providers/db'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from "lucide-react";

interface Patient {
  id?: string;
  p_id?: string;
  name: string;
  dob: string;
  gender: string;
  blood_group: string;
  email_id: string;
  address: string;
  mobile_no: string;
  cghs_private: string;
  password: string;
  created_at?: string;
}

export default function AddPatient() {
  const router = useRouter()
  const [patient, setPatient] = useState<Patient>({
    name: '',
    dob: '',
    gender: '',
    blood_group: '',
    email_id: '',
    address: '',
    mobile_no: '',
    cghs_private: '',
    password: '',
  });
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setPatient((prev) => ({ ...prev, [name]: value }))
    setError(null)
  }

  useEffect(() => {
    const unparsed_patient_id = localStorage.getItem('patientInfo');
    if (unparsed_patient_id) {
      const parsedPatient = JSON.parse(unparsed_patient_id);
      console.log(parsedPatient, "im here");
      setPatient(parsedPatient);
    }
  }, []);
  

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const { error } = await supabase.rpc('update_patient', {
  p_p_id: patient.p_id,
  p_name: patient.name,
  p_dob: patient.dob,
  p_gender: patient.gender,
  p_blood_group: patient.blood_group,
  p_email_id: patient.email_id,
  p_address: patient.address,
  p_mobile_no: patient.mobile_no,
  p_cghs_private: patient.cghs_private,
  p_password: patient.password,
});

if (error) {
  console.error('Update failed:', error.message);
}


        localStorage.setItem("patientInfo", JSON.stringify(patient));

      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
        setTimeout(() => {
          router.push('/patient/patientinfo')
        }, 2000)
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 transform transition-all duration-300 hover:shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">🏥</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Edit Patient Information</h2>
            <p className="text-gray-600">Please fill in your details to create an account</p>
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

          {success && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-xl">✅</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700 font-medium">
                    Registration successful! Redirecting to your profile...
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center">
                  <span className="mr-2">👤</span>
                  Full Name
                </span>
              </label>
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={patient?.name || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                required
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center">
                  <span className="mr-2">📅</span>
                  Date of Birth
                </span>
              </label>
              <input
                type="date"
                name="dob"
                value={patient?.dob || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                required
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center">
                  <span className="mr-2">⚧️</span>
                  Gender
                </span>
              </label>
              <select
                name="gender"
                value={patient?.gender || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center">
                  <span className="mr-2">🩸</span>
                  Blood Group
                </span>
              </label>
              <select
                name="blood_group"
                value={patient?.blood_group || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                required
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center">
                  <span className="mr-2">📧</span>
                  Email Address
                </span>
              </label>
              <input
                type="email"
                name="email_id"
                placeholder="Enter your email"
                value={patient?.email_id || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                required
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center">
                  <span className="mr-2">📱</span>
                  Mobile Number
                </span>
              </label>
              <input
                type="tel"
                name="mobile_no"
                placeholder="Enter your mobile number"
                value={patient?.mobile_no || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                required
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center">
                  <span className="mr-2">🏠</span>
                  Address
                </span>
              </label>
              <input
                type="text"
                name="address"
                placeholder="Enter your address"
                value={patient?.address || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                required
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center">
                  <span className="mr-2">🏥</span>
                  Patient Type
                </span>
              </label>
              <select
                name="cghs_private"
                value={patient?.cghs_private || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                required
              >
                <option value="">Select Type</option>
                <option value="CGHS">CGHS</option>
                <option value="Private">Private</option>
              </select>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center">
                  <span className="mr-2">🔒</span>
                  Password
                </span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create a password"
                  value={patient?.password || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg shadow-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </span>
                ) : (
                  "Update Information"
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <a 
                href="/auth/patientlogin" 
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition duration-200"
              >
                Sign in here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
