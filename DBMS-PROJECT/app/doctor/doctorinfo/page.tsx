"use client"
import React, { useEffect, useState } from 'react'
import LogoutButton from '@/components/Logoutbutton';
import { useRouter } from 'next/navigation';

interface DoctorInfo {
  name: string;
  age: number;
  gender: string;
  specialization: string;
  experience: number;
  mobile_no: string;
  email_id: string;
  schedule: string;
  consult_fees: number;
}

const DoctorInfoPage = () => {
  const [doctorInfo, setDoctorInfo] = useState<DoctorInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  useEffect(() => {
    const getDoctorInfo = async () => {
      try {
        // First check localStorage
        const cachedData = localStorage.getItem('doctorInfo');
        console.log(cachedData, 'cachedData');
        if (cachedData) {
          const parsedData = JSON.parse(cachedData);
          console.log(parsedData, "im here");
          setDoctorInfo(parsedData);
          setLoading(false);
          return;
        }

        const response = await fetch('/api/getpatient', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          const info = data.user;
          if (info) {
            // Save to localStorage
            localStorage.setItem('doctorInfo', JSON.stringify(info));
            setDoctorInfo(info);
            setLoading(false);
          } else {
            localStorage.removeItem('doctorInfo');
            router.push('/auth/doctorlogin');
          }
        } else {
          localStorage.removeItem('doctorInfo');
          router.push('/auth/doctorlogin');
        }
      } catch (error) {
        localStorage.removeItem('doctorInfo');
        router.push('/auth/doctorlogin');
      }
    };

    getDoctorInfo();
  }, [router]);

  const formatSchedule = (schedule: string) => {
    if (!schedule) return [];
    
    // Split the schedule string by commas and clean up each entry
    return schedule.split(',').map(s => s.trim());
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⚕️</div>
          <p className="text-gray-600">Loading doctor information...</p>
        </div>
      </div>
    );
  }

  if (!doctorInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-600">
          <div className="text-4xl mb-4">🔍</div>
          <p>No doctor information found</p>
        </div>
      </div>
    );
  }

  const scheduleItems = formatSchedule(doctorInfo.schedule);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-6">
            <div className="flex items-center space-x-4">
              <div className="bg-white p-3 rounded-full">
                <span className="text-4xl">👨‍⚕️</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{doctorInfo.name}</h1>
                <p className="text-blue-100">{doctorInfo.specialization}</p>
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8">
            {/* Personal Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
                Personal Information
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500">Age</label>
                  <p className="text-gray-800">{doctorInfo.age} years</p>
                </div>
                
                <div>
                  <label className="text-sm text-gray-500">Gender</label>
                  <p className="text-gray-800">{doctorInfo.gender}</p>
                </div>
                
                <div>
                  <label className="text-sm text-gray-500">Experience</label>
                  <p className="text-gray-800">{doctorInfo.experience} years</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
                Contact Information
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500">Email</label>
                  <p className="text-gray-800">{doctorInfo.email_id}</p>
                </div>
                
                <div>
                  <label className="text-sm text-gray-500">Mobile</label>
                  <p className="text-gray-800">{doctorInfo.mobile_no}</p>
                </div>
              </div>
            </div>

            {/* Practice Information */}
            <div className="space-y-6 md:col-span-2">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
                Practice Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="text-sm text-gray-500">Schedule</label>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    {scheduleItems.map((schedule, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <p className="text-gray-800">{schedule}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm text-gray-500">Consultation Fees</label>
                  <p className="text-gray-800">₹{doctorInfo.consult_fees}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-4 border-t">
            <p className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleDateString()}
            </p>
            <LogoutButton removeitem="doctorInfo" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorInfoPage;