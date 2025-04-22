// pages/patient/[id].tsx
'use client'
import React, { useState, useEffect } from 'react';
import { redirect, useRouter } from 'next/navigation';
import Head from 'next/head';
import LogoutButton from '@/components/Logoutbutton';

// Define the Patient interface
interface Patient {
  p_id: string;
  name: string;
  dob: string;
  gender: string;
  blood_group: string;
  email_id: string;
  address: string;
  mobile_no: string;
  cghs_private: string;
  created_at: string;
  password: string;
}

// Emoji mapping for different patient attributes
const emojiMap = {
  name: '👤',
  dob: '🎂',
  gender: '⚧️',
  blood_group: '🩸',
  email_id: '📧',
  address: '🏠',
  mobile_no: '📱',
  cghs_private: '🏥',
  created_at: '⏰',
};

// Function to calculate age from date of birth
const calculateAge = (dob: string): number => {
    console.log(dob, 'dob');
  const birthDate = new Date(dob);
  console.log(birthDate, 'birthDate');
  const today = new Date();
  console.log(today, 'today');
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  console.log(monthDiff, 'monthDiff');
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Function to format date to a more readable format
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const PatientInfoPage: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [mockPatient, setMockPatient] = useState<Patient | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Blood group emoji mapping
  const getBloodGroupEmoji = (bloodGroup: string): string => {
    const bloodGroups: {[key: string]: string} = {
      'A+': '🅰️➕',
      'A-': '🅰️➖',
      'B+': '🅱️➕',
      'B-': '🅱️➖',
      'AB+': '🆎➕',
      'AB-': '🆎➖',
      'O+': '🅾️➕',
      'O-': '🅾️➖'
    };
    return bloodGroups[bloodGroup] || '🩸';
  };

  // Gender emoji mapping
  const getGenderEmoji = (gender: string): string => {
    const genders: {[key: string]: string} = {
      'Male': '👨',
      'Female': '👩',
      'Other': '👤'
    };
    return genders[gender] || '⚧️';
  };

  // Simulate loading state for better UX
  useEffect(() => {
    const getPatient = async () => {
      try {
        // First check localStorage
        const cachedData = localStorage.getItem('patientInfo');
        if (cachedData) {
          const parsedData = JSON.parse(cachedData);
          setMockPatient(parsedData);
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
            localStorage.setItem('patientInfo', JSON.stringify(info));
            console.log(localStorage.getItem('patientInfo'), 'info');
            setMockPatient(info);
            setLoading(false);
          } else {
            localStorage.removeItem('patientInfo');
            router.push('/auth/patientlogin');
          }
        } else {
          localStorage.removeItem('patientInfo');
          router.push('/auth/patientlogin');
        }
      } catch (error) {
        localStorage.removeItem('patientInfo');
        router.push('/auth/patientlogin');
      }
    };
    getPatient();   
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-r from-blue-100 to-purple-100">
        <div className="text-center">
          <div className="animate-pulse text-4xl mb-4">💉</div>
          <p className="text-xl font-semibold text-gray-700">Loading patient data...</p>
        </div>
      </div>
    );
  }
  

  return (
    <>
      <Head>
        <title>Patient: {mockPatient?.name} | Medical Dashboard</title>
        <meta name="description" content="Patient information dashboard" />
      </Head>

      <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-indigo-800 flex items-center gap-2">
                  {getGenderEmoji(mockPatient?.gender || '')} {mockPatient?.name}
                </h1>
                <div className="flex items-center mt-2 text-gray-600">
                  <span className="mr-4 flex items-center">
                    <span className="mr-1">{emojiMap.dob}</span> 
                    {formatDate(mockPatient?.dob || '')} ({calculateAge(mockPatient?.dob || '')} years)
                  </span>
                  <span className="flex items-center">
                    <span className="mr-1">{getBloodGroupEmoji(mockPatient?.blood_group || '')}</span> 
                    {mockPatient?.blood_group}
                  </span>
                </div>
              </div>
              <div className="mt-4 md:mt-0">
                <div className="bg-indigo-100 rounded-lg px-4 py-2 flex items-center">
                  <span className="font-medium text-indigo-800">
                    {mockPatient?.cghs_private === 'CGHS' ? '🏥 CGHS Patient' : '🏢 Private Patient'}
                  </span>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  ID: {mockPatient?.p_id?.substring(0, 8)}...
                </div>
                <div className="mt-2">
                  <LogoutButton removeitem="patientInfo" />
                </div>
              </div>
            </div>
          </div>

          {/* Patient Details Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 bg-indigo-600 text-white">
              <h2 className="text-xl font-semibold flex items-center">
                <span className="mr-2">📋</span> Patient Information
              </h2>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-800 mb-4 border-b pb-2">
                  📞 Contact Details
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="text-xl mr-3 text-indigo-500">{emojiMap.mobile_no}</div>
                    <div>
                      <div className="font-medium">Phone</div>
                      <div className="text-gray-700">{mockPatient?.mobile_no || 'Not provided'}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="text-xl mr-3 text-indigo-500">{emojiMap.email_id}</div>
                    <div>
                      <div className="font-medium">Email</div>
                      <div className="text-gray-700 break-words">{mockPatient?.email_id || 'Not provided'}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="text-xl mr-3 text-indigo-500">{emojiMap.address}</div>
                    <div>
                      <div className="font-medium">Address</div>
                        <div className="text-gray-700">{mockPatient?.address || 'Not provided'}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Medical Information Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-800 mb-4 border-b pb-2">
                  🩺 Medical Information
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="text-xl mr-3 text-indigo-500">{emojiMap.gender}</div>
                    <div>
                      <div className="font-medium">Gender</div>
                        <div className="text-gray-700">{mockPatient?.gender}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="text-xl mr-3 text-indigo-500">{emojiMap.blood_group}</div>
                    <div>
                      <div className="font-medium">Blood Group</div>
                      <div className="text-gray-700 flex items-center">
                        {mockPatient?.blood_group} 
                        <span className="ml-2">{getBloodGroupEmoji(mockPatient?.blood_group || '')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="text-xl mr-3 text-indigo-500">{emojiMap.created_at}</div>
                    <div>
                      <div className="font-medium">Registration Date</div>
                      <div className="text-gray-700">
                        {formatDate(mockPatient?.created_at || '')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6 bg-gray-50 border-t flex flex-wrap gap-3">
              
              
            </div>
          </div>

          {/* Additional Card for quick actions */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition">
              <div className="text-center">
                <div className="text-3xl mb-2">💊</div>
                <h3 className="font-medium">Medications</h3>
                <p className="text-sm text-gray-600 mt-1">View & manage prescriptions</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition">
              <div className="text-center">
                <div className="text-3xl mb-2">📊</div>
                <h3 className="font-medium">Lab Results</h3>
                <p className="text-sm text-gray-600 mt-1">Check latest test results</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition">
              <div className="text-center">
                <div className="text-3xl mb-2">📝</div>
                <h3 className="font-medium">Notes</h3>
                <p className="text-sm text-gray-600 mt-1">Clinical notes & history</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PatientInfoPage;