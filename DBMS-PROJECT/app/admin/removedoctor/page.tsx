"use client"
import React, { useState, useEffect } from 'react'
import { supabase } from '@/providers/db'

interface Doctor {
  d_id: number;
  name: string;
  specialization: string;
  experience: number;
  email_id: string;
}

const RemoveDoctorPage = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('doctor')
        .select('d_id, name, specialization, experience, email_id')
        .order('name')

      if (error) throw error

      setDoctors(data || [])
      setLoading(false)
    } catch (err) {
      console.error('Error fetching doctors:', err)
      setError('Failed to load doctors')
      setLoading(false)
    }
  }

  const handleRemoveDoctor = async (doctorId: number) => {
    try {
      const { data: doctorData, error } = await supabase
        .from('doctor')
        .delete()
        .eq('d_id', doctorId)
        .select();
       
      console.log(doctorData, "doctorData");
      let location_id;
      let doctor_id;
      if (doctorData) {
        location_id = doctorData[0].location_id;
        doctor_id = doctorData[0].d_id;
        console.log(location_id, "location_id");
      }

      const doctor_session = localStorage.getItem('doctorInfo');
      let doctor_id_session; 
      if (doctor_session) {
        const doctor_session_data = JSON.parse(doctor_session);
        console.log(doctor_session_data, "doctor_session_data");
        doctor_id_session = doctor_session_data.d_id;
      }

      if (error) throw error

      else {
        if(doctor_id_session === doctor_id) {
          const { error: error2 } = await supabase.rpc('unassign_location', {
            loc_id: location_id
          });
        }
            

        if (error) throw error; 
      }
      

      setDoctors(doctors.filter(doctor => doctor.d_id !== doctorId))
      setSuccessMessage('Doctor removed successfully')
      setShowConfirmation(false)
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      console.error('Error removing doctor:', err)
      setError('Failed to remove doctor')
      setShowConfirmation(false)
      setTimeout(() => setError(null), 3000)
    }
  }

  const openConfirmationDialog = (doctor: Doctor) => {
    setSelectedDoctor(doctor)
    setShowConfirmation(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⚕️</div>
          <p className="text-gray-600">Loading doctors...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Remove Doctor</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {successMessage}
          </div>
        )}

        {showConfirmation && selectedDoctor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Confirm Removal</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to remove {selectedDoctor.name}? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRemoveDoctor(selectedDoctor.d_id)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialization</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {doctors.map((doctor) => (
                <tr key={doctor.d_id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{doctor.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doctor.specialization}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doctor.experience} years</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doctor.email_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => openConfirmationDialog(doctor)}
                      className="text-red-600 hover:text-red-900 font-medium"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default RemoveDoctorPage