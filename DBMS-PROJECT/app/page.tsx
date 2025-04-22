"use client"
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  const [adminInfo, setAdminInfo] = useState<any>(null);
  const [patientInfo, setPatientInfo] = useState<any>(null);
  const [doctorInfo, setDoctorInfo] = useState<any>(null);
  useEffect(() => {
    const adminInfo = localStorage.getItem('adminInfo');
    if (adminInfo) {
      setAdminInfo(JSON.parse(adminInfo));
    }
    const patientInfo = localStorage.getItem('patientInfo');
    if (patientInfo) {
      setPatientInfo(JSON.parse(patientInfo));
    }
    const doctorInfo = localStorage.getItem('doctorInfo');
    if (doctorInfo) {
      setDoctorInfo(JSON.parse(doctorInfo));
    }
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 animate-gradient"></div>
        <div className="container mx-auto px-4 py-16 relative">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-blue-800 mb-4 animate-fade-in">
              🏥 Healthcare Portal
            </h1>
            <p className="text-xl text-gray-600 mb-8 animate-fade-in-delay">
              Your one-stop solution for healthcare management
            </p>
          </div>
        </div>
      </div>

      {/* Options Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Patient Login */}
          <Link href={patientInfo ? "/patient/patientinfo" : "/auth/patientlogin"} className="group">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-blue-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100 rounded-full transform translate-x-12 -translate-y-12 opacity-20 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative">
                <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  👤
                </div>
                <h2 className="text-2xl font-semibold text-blue-800 mb-3">
                  {patientInfo ? "My patient portal" : "Patient Login"}
                </h2>
                <p className="text-gray-600">
                  Access your medical records, appointments, and health information
                </p>
              </div>
            </div>
          </Link>

          {/* Doctor Login */}
          <Link href={doctorInfo ? "/doctor/doctorinfo" : "/auth/doctorlogin"} className="group">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-green-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-green-100 rounded-full transform translate-x-12 -translate-y-12 opacity-20 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative">
                <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  👨‍⚕️
                </div>
                <h2 className="text-2xl font-semibold text-green-800 mb-3">
                    {doctorInfo ? "My doctor portal" : "Doctor Login"}
                </h2>
                <p className="text-gray-600">
                  Manage your practice, appointments, and patient records
                </p>
              </div>
            </div>
          </Link>

          {/* Admin Login */}
          <Link href={adminInfo ? "/admin/admininfo" : "/auth/adminlogin"} className="group">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-purple-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-100 rounded-full transform translate-x-12 -translate-y-12 opacity-20 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative">
                <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  👨‍💼
                </div>
                <h2 className="text-2xl font-semibold text-purple-800 mb-3">
                  {adminInfo ? "My admin portal" :  "Admin Login"}
                </h2>
                <p className="text-gray-600">
                  System administration and healthcare facility management
                </p>
              </div>
            </div>
          </Link>

          {/* Patient Registration */}
          <Link href={"/patientform"} className="group">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-pink-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-pink-100 rounded-full transform translate-x-12 -translate-y-12 opacity-20 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative">
                <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  ✨
                </div>
                <h2 className="text-2xl font-semibold text-pink-800 mb-3">
                  New Patient Registration
                </h2>
                <p className="text-gray-600">
                  Create your account to access healthcare services
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="text-3xl mb-4">🔒</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Secure Access</h3>
              <p className="text-gray-600">Your health information is protected with advanced security</p>
            </div>
            <div className="p-6">
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Quick & Easy</h3>
              <p className="text-gray-600">Simple and intuitive interface for all users</p>
            </div>
            <div className="p-6">
              <div className="text-3xl mb-4">💬</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">24/7 Support</h3>
              <p className="text-gray-600">Our support team is always here to help you</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>Need assistance? Contact our support team at support@healthcare.com</p>
          <p className="mt-2 text-sm">© 2024 Healthcare Portal. All rights reserved.</p>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .animate-gradient {
          animation: gradient 15s ease infinite;
          background-size: 200% 200%;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }

        .animate-fade-in-delay {
          animation: fadeIn 0.8s ease-out 0.2s forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}