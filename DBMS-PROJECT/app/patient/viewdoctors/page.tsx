"use client"
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/providers/db'

interface Doctor {
  d_id: number;
  name: string;
  specialization: string;
  experience: number;
  mobile_no: string;
  email_id: string;
  consult_fees: number;
  schedule: string;
}

const ViewDoctorsPage = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSchedules, setExpandedSchedules] = useState<{ [key: number]: boolean }>({});
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>('all');
  const router = useRouter();

  const specializations = [
    'all',
    'Cardiology',
    'Neurology',
    'Pediatrics',
    'Orthopedics',
    'Dermatology',
    'Ophthalmology',
    'ENT',
    'Psychiatry',
    'Dentistry',
    'General Medicine',
    'Gynecology',
    'Urology'
  ];

  const filteredDoctors = selectedSpecialization === 'all'
    ? doctors
    : doctors.filter(doctor => doctor.specialization === selectedSpecialization);

  const toggleSchedule = (doctorId: number) => {
    setExpandedSchedules(prev => ({
      ...prev,
      [doctorId]: !prev[doctorId]
    }));
  };

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const data = await supabase.from('doctor').select('*');
        console.log(data);
        if (data.data) {
          setDoctors(data.data as Doctor[]);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching doctors:', error);
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⚕️</div>
          <p className="text-gray-600">Loading doctors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Available Doctors</h1>
          <p className="text-gray-600">Find and book appointments with our experienced medical professionals</p>
        </div>

        {/* Specialization Filter */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex items-center space-x-2">
            <label htmlFor="specialization" className="text-gray-700 font-medium">Filter by Specialization:</label>
            <select
              id="specialization"
              value={selectedSpecialization}
              onChange={(e) => setSelectedSpecialization(e.target.value)}
              className="block w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {specializations.map((spec) => (
                <option key={spec} value={spec}>
                  {spec === 'all' ? 'All Specializations' : spec}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredDoctors.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-gray-600">No doctors found in this specialization</p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {filteredDoctors.map((doctor) => (
              <div key={doctor.d_id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="bg-purple-100 p-3 rounded-full">
                      <span className="text-2xl">👨‍⚕️</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{doctor.name}</h2>
                      <p className="text-purple-600 font-medium">{doctor.specialization}</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-gray-600">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>{doctor.experience} years experience</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>{doctor.mobile_no}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>{doctor.email_id}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>₹{doctor.consult_fees} per consultation</span>
                    </div>
                  </div>

                  {/* Schedule Section */}
                  <div className="mb-6">
                    <button
                      onClick={() => toggleSchedule(doctor.d_id)}
                      className="w-full flex items-center justify-between p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors duration-200"
                    >
                      <span className="text-purple-700 font-medium">View Schedule</span>
                      <svg
                        className={`w-5 h-5 text-purple-700 transform transition-transform duration-200 ${
                          expandedSchedules[doctor.d_id] ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        expandedSchedules[doctor.d_id] ? 'max-h-96 opacity-100 mt-3' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="bg-purple-50 rounded-lg p-4">
                        <div className="space-y-2">
                          {doctor.schedule.split(',').map((day, index) => (
                            <div key={index} className="flex items-center text-gray-700">
                              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                              <span>{day.trim()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewDoctorsPage;