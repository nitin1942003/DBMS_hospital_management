'use client'
import React, { useEffect, useState } from 'react'
import { supabase } from '@/providers/db'
import Link from 'next/link'
import { daysBetweenDates } from '@/lib/findnumberofdays'
interface Prescription {
  appointment_id: string
  diagnosis: string
  created_at: string | null
  patients: {
    name: string
    gender: string
  }
  p_id: string
  admit_advise: {
    info: {
      admissionDate: string
    }
    patient_consent: string
  }
}

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [discharging, setDischarging] = useState<string | null>(null)
  const [showDischargeModal, setShowDischargeModal] = useState<string | null>(null)
  const [dischargeDate, setDischargeDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        // Get doctor info from localStorage
        const unparsedDoctorInfo = localStorage.getItem('doctorInfo')
        if (!unparsedDoctorInfo) {
          throw new Error('Doctor information not found')
        }
        
        const doctorInfo = JSON.parse(unparsedDoctorInfo)
        const doctorId = doctorInfo.d_id;
        console.log(doctorId, "doctorId")
        
        // Fetch prescriptions with patient information where patient_consent is accepted
        const { data, error } = await supabase
          .from('prescription')
          .select(
            '*, patients(name,gender)'
          )
          .eq('d_id', doctorId)
          .not('admit_advise', 'is', null)
          
        console.log(data, "data")
        
        if (error) {
          console.log(error, "error")
          throw error
        }

        // Filter data where patient_consent is accepted
        const filteredData = data.filter(item => 
          item.admit_advise && item.admit_advise.patient_consent === 'accepted'
        );

        console.log(filteredData, "filteredData")
        
        // Transform data to match our interface
        const formattedData = filteredData.map((item: any) => ({
          appointment_id: item.appointment_id,
          diagnosis: item.diagnosis,
          created_at: item.created_at,
          patients: {
            name: item.patients.name,
            gender: item.patients.gender
          },
          p_id: item.p_id,
          admit_advise: item.admit_advise
        }))

        // Sort by created_at (null values at bottom)
        const sortedData = formattedData.sort((a, b) => {
          if (!a.created_at) return 1
          if (!b.created_at) return -1
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        })

        // Ensure unique items by filtering out duplicates based on p_id
        const uniquePrescriptions = Array.from(
          new Map(sortedData.map(item => [item.p_id, item])).values()
        );

        console.log(uniquePrescriptions, "uniquePrescriptions")

        setPrescriptions(uniquePrescriptions)
      } catch (err) {
        console.error('Error fetching prescriptions:', err)
        setError(err instanceof Error ? err.message : 'Failed to load prescriptions')
      } finally {
        setLoading(false)
      }
    }

    fetchPrescriptions()
  }, [])

  const openDischargeModal = (appointmentId: string) => {
    setShowDischargeModal(appointmentId)
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    setDischargeDate(`${year}-${month}-${day}`); // Format as YYYY-MM-DD
    console.log(`${year}-${month}-${day}`, "dischargeDate");
  }

  const closeDischargeModal = () => {
    setShowDischargeModal(null)
  }

  const handleDischarge = async (appointmentId: string, reportingTime: string) => {
    try {
      setDischarging(appointmentId)
      
      console.log(dischargeDate, "dischargeDate in handleDischarge");
      console.log(reportingTime, "reportingTime in handleDischarge");
      const days = daysBetweenDates(dischargeDate, reportingTime);
      console.log(days, "days");
      
      const bill = days * 1000;

      const { data, error } = await supabase.rpc('update_bill_by_appointment_id', {
        input_appointment_id: appointmentId,
        input_amount: bill
      });
      
      
      if (error) {
        console.log(error, "error in updateBill");
        throw error
      }

      const prescription = await supabase.from('prescription').select('admit_advise').eq('appointment_id', appointmentId);
      console.log(prescription, "prescription");
      let admit_advise_final = null;
      if (prescription.data) {
        let admit_advise = prescription.data[0].admit_advise;
        console.log(admit_advise, "admit_advise");
        admit_advise.patient_consent = 'discharged';
        console.log(admit_advise, "admit_advise after update");
        admit_advise_final = admit_advise;
      }

      const { data: prescriptionData, error: prescriptionError } = await supabase.rpc('update_admit_advise_json', {
        input_appointment_id: appointmentId,
        input_admit_advise: admit_advise_final
      });

      
      

      if (prescriptionError) {
        console.log(prescriptionError, "prescriptionError");
        throw prescriptionError
      }

      const { data: bedData, error: bedError } = await supabase.rpc('clear_bed_allocation_by_appointment', {
        input_appointment_id: appointmentId
      });
      

      if (bedError) {
        console.log(bedError, "bedError");
        throw bedError
      }

      // Remove the discharged patient from the list
      setPrescriptions(prev => prev.filter(p => p.appointment_id !== appointmentId))
      setShowDischargeModal(null)
      
    } catch (err) {
      console.error('Error discharging patient:', err)
      alert('Failed to discharge patient. Please try again.')
    } finally {
      setDischarging(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-4 bg-red-50 rounded-lg">
        <p className="text-red-600 text-center">{error}</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Admitted Patients</h1>
      
      {prescriptions.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-gray-600">No admitted patients found.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {prescriptions.map((prescription, index) => (
            <div key={`${prescription.p_id}-${index}`} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">{prescription.patients.name}</h2>
                  <p className="text-gray-600 mt-1">Gender: {prescription.patients.gender}</p>
                  <div className="mt-3">
                    <p className="font-medium text-gray-700">Diagnosis:</p>
                    <p className="text-gray-600 mt-1">{prescription.diagnosis}</p>
                  </div>
                  <div className="mt-4 flex gap-4">
                    <Link 
                      href={`/doctor/prescriptions/${prescription.p_id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                    >
                      <span>View & Edit Prescription</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                    <div className="relative">
                      <button
                        onClick={() => openDischargeModal(prescription.appointment_id)}
                        disabled={discharging === prescription.appointment_id}
                        className="text-red-600 hover:text-red-800 font-medium flex items-center disabled:opacity-50"
                      >
                        {discharging === prescription.appointment_id ? (
                          <>
                            <span>Discharging...</span>
                            <div className="ml-2 h-4 w-4 border-t-2 border-red-600 rounded-full animate-spin"></div>
                          </>
                        ) : (
                          <>
                            <span>Discharge Patient</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                          </>
                        )}
                      </button>
                      
                      {showDischargeModal === prescription.appointment_id && (
                        <div className="absolute z-10 mt-2 right-0 bg-white p-4 rounded-md shadow-lg border border-gray-200 w-64">
                          <div className="mb-3">
                            <label htmlFor="dischargeDate" className="block text-sm font-medium text-gray-700 mb-1">
                              Discharge Date
                            </label>
                            <input
                              type="date"
                              id="dischargeDate"
                              value={dischargeDate}
                              onChange={(e) => {
                                setDischargeDate(e.target.value);
                                console.log(e.target.value, "dischargeDate changed");
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                          </div>
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={closeDischargeModal}
                              className="px-3 py-1 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleDischarge(prescription.appointment_id, prescription.admit_advise.info.admissionDate)}
                              className="px-3 py-1 text-sm text-white bg-red-600 hover:bg-red-700 rounded-md shadow-sm"
                            > {prescription.admit_advise.info.admissionDate}
                              Confirm
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {prescription.created_at ? (
                    new Date(prescription.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })
                  ) : (
                    'No date'
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Prescriptions