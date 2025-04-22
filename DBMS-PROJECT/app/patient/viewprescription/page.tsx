'use client'
import React, { useEffect, useState, Suspense } from 'react'
import { supabase } from '@/providers/db'
import { useSearchParams } from 'next/navigation'

interface Medication {
  name: string
  dosage: string
  comments: string
  duration: string
}

interface Test {
  name: string
  description: string
}

interface Prescription {
  appointment_id: string
  p_id: string
  d_id: string
  diagnosis: string
  date: string
  medication: Medication[]
  Tests: Test[]
  to_pharmacist: boolean
}

// Component that uses searchParams
function ViewPrescriptionContent() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)
  const [make, setMake] = useState(false);
  const searchParams = useSearchParams()

  const handleclick = async (appointment_id: string) => {
    const { data, error } = await supabase.rpc('mark_prescription_to_pharmacist', {
      p_appointment_id: appointment_id,
    });

    console.log(data, "data");
    
    if (error) {
      console.error('RPC update failed:', error.message);
    } else {
      setMake(true);
      console.log('Updated prescription:', data);
    }
  }
 

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const patientInfo = localStorage.getItem('patientInfo')
        if (!patientInfo) {
          console.error('Patient info not found in localStorage')
          setLoading(false)
          return
        }

        const appointment_id = searchParams.get('appointment_id');
        
        const { data, error } = await supabase
          .from('prescription')
          .select('*')
          .eq('appointment_id', appointment_id)

        console.log(data, "Vdsvds")
        
        if (error) {
          console.error('Error fetching prescriptions:', error)
        } else if (data) {
          setPrescriptions(data)
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPrescriptions()
  }, [supabase])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">💊</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Prescriptions</h1>
          <p className="text-gray-600">View your medical prescriptions and treatment plans</p>
        </div>

        {prescriptions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-8 text-center">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-lg text-gray-600">No prescriptions found yet.</p>
            <p className="text-sm text-gray-500 mt-2">Your doctor will add prescriptions after your consultation.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {prescriptions.map((prescription, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-md p-8 transition-all duration-300 hover:shadow-lg border-l-4 border-blue-500">
                <div className="border-b pb-4 mb-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-blue-700">
                      <span className="mr-2">📝</span>
                      Prescription #{index + 1}
                    </h2>
                    <span className="text-gray-500 bg-blue-50 px-3 py-1 rounded-full">
                      <span className="mr-1">📅</span>
                      {new Date(prescription.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    <span className="mr-2">🔍</span>
                    Diagnosis
                  </h3>
                  <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">{prescription.diagnosis}</p>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    <span className="mr-2">💊</span>
                    Medications
                  </h3>
                  <div className="bg-gray-50 rounded-lg overflow-hidden shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dosage</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comments</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {prescription.medication.map((med, idx) => (
                          <tr key={idx} className="hover:bg-blue-50 transition-colors duration-150">
                            <td className="px-4 py-3 text-sm text-gray-900">💊 {med.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">⏱️ {med.dosage}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">📆 {med.duration}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">📝 {med.comments}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {prescription.Tests && prescription.Tests.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                      <span className="mr-2">🔬</span>
                      Tests
                    </h3>
                    <div className="bg-gray-50 rounded-lg overflow-hidden shadow-sm">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {prescription.Tests.map((test, idx) => (
                            <tr key={idx} className="hover:bg-blue-50 transition-colors duration-150">
                              <td className="px-4 py-3 text-sm text-gray-900">🧪 {test.name}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">📋 {test.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                <div className="mt-6 text-center">{ !make && !prescription.to_pharmacist ? <button onClick={() => handleclick(prescription.appointment_id)} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 shadow-md">
                    <span className="mr-2">🖨️</span>
                    forward to pharmacist
                  </button> : <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 shadow-md">
                    <span className="mr-2">🖨️</span>
                    prescription forwarded
                  </button>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Main component with Suspense boundary
const ViewPrescription = () => {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>}>
      <ViewPrescriptionContent />
    </Suspense>
  );
};

export default ViewPrescription