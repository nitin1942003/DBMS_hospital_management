"use client"
import React, { useState, useEffect } from 'react'
import { supabase } from '@/providers/db'
import Link from 'next/link'

interface Medication {
  name: string
  dosage: string
  comments: string
  duration: string
}

interface Prescription {
  id: number
  p_id: number
  appointment_id: string
  patient_id: string
  doctor_id: string
  prescription_date: string
  medication: Medication[]
  to_pharmacist: boolean
  is_given: boolean
  patient_name?: string
  doctor_name?: string
}

const GiveMedicinePage = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'dispensed'>('all')
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null)

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        setLoading(true)
        
        // Fetch prescriptions where to_pharmacist is true
        const { data, error } = await supabase
          .from('prescription')
          .select('appointment_id, medication, p_id, patients(p_id, name), d_id, doctor(d_id, name)')
          .eq('to_pharmacist', true)

        

          console.log(data, "this is data");

        if (error) throw error
        
        // Transform the data to include patient and doctor names
        const formattedData = data.map((item: any) => ({
          id: item.p_id,
          p_id: item.p_id,
          appointment_id: item.appointment_id,
          patient_id: item.patients?.p_id,
          doctor_id: item.doctors?.d_id,
          prescription_date: item.prescription_date,
          medication: item.medication || [],
          to_pharmacist: item.to_pharmacist,
          is_given: item.is_given,
          patient_name: item.patients?.name,
          doctor_name: item.doctors?.name
        }))
        
        setPrescriptions(formattedData)
      } catch (err) {
        console.error('Error fetching prescriptions:', err)
        setError('Failed to load prescriptions')
      } finally {
        setLoading(false)
      }
    }

    fetchPrescriptions()
  }, [])

  const handleGiveMedicine = async (id: number) => {
    try {
      const { error } = await supabase
        .from('prescription')
        .update({ is_given: true })
        .eq('p_id', id)
      
      if (error) throw error
      
      // Update local state
      setPrescriptions(prescriptions.map(prescription => 
        prescription.p_id === id 
          ? { ...prescription, is_given: true } 
          : prescription
      ))
      
      setNotification({
        message: 'Medicine dispensed successfully!',
        type: 'success'
      })
      
      // Clear notification after 3 seconds
      setTimeout(() => {
        setNotification(null)
      }, 3000)
    } catch (err) {
      console.error('Error updating prescription:', err)
      setError('Failed to update prescription')
      setNotification({
        message: 'Failed to dispense medicine',
        type: 'error'
      })
      
      // Clear notification after 3 seconds
      setTimeout(() => {
        setNotification(null)
      }, 3000)
    }
  }

  // Filter prescriptions based on search term and filter status
  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = 
      prescription.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.doctor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.medication.some(med => med.name.toLowerCase().includes(searchTerm.toLowerCase()))
    
    if (filterStatus === 'all') return matchesSearch
    if (filterStatus === 'pending') return matchesSearch && !prescription.is_given
    if (filterStatus === 'dispensed') return matchesSearch && prescription.is_given
    
    return matchesSearch
  })

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      <span className="ml-3 text-lg">Loading prescriptions...</span>
    </div>
  )
  
  if (error) return (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 mt-20">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 mt-16">
      <h1 className="text-2xl font-bold mb-6">Pharmacy Dispensary Dashboard</h1>
      
      {notification && (
        <div className={`mb-4 p-4 rounded-md ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {notification.type === 'success' ? (
                <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className="font-medium">{notification.message}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search by patient, doctor, or medication..."
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-gray-700">Status:</span>
            <select
              className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'pending' | 'dispensed')}
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="dispensed">Dispensed</option>
            </select>
          </div>
        </div>
      </div>
      
      {filteredPrescriptions.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="mt-2 text-gray-600">No prescriptions match your criteria.</p>
          {searchTerm && <p className="text-sm text-gray-500">Try adjusting your search or filters.</p>}
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredPrescriptions.map((prescription) => (
            <div key={`prescription-${prescription.p_id}-${prescription.appointment_id}`} className={`bg-white p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg ${prescription.is_given ? 'border-l-4 border-green-500' : 'border-l-4 border-yellow-500'}`}>
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold">Prescription #{prescription.p_id}</h2>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${prescription.is_given ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {prescription.is_given ? 'Dispensed' : 'Pending'}
                </span>
              </div>
              
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Medications:</h3>
                {prescription.medication.map((med, index) => (
                  <div key={`med-${prescription.p_id}-${index}`} className="mt-2 p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
                    <p className="font-medium text-blue-700">{med.name}</p>
                    <div className="grid grid-cols-2 gap-2 mt-1 text-sm">
                      <p className="text-gray-600"><span className="font-medium">Dosage:</span> {med.dosage}</p>
                      <p className="text-gray-600"><span className="font-medium">Duration:</span> {med.duration}</p>
                    </div>
                    {med.comments && <p className="text-gray-600 mt-1 italic">{med.comments}</p>}
                  </div>
                ))}
              </div>
              
              <div className="mb-4 p-3 bg-blue-50 rounded-md">
                <div className="flex items-center mb-1">
                  <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <p className="text-gray-700">
                    <span className="font-medium">Patient:</span> {prescription.patient_name || 'Unknown'}
                  </p>
                </div>
                <div className="flex items-center mb-1">
                  <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-700">
                    <span className="font-medium">Doctor:</span> {prescription.doctor_name || 'Unknown'}
                  </p>
                </div>
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-700">
                    <span className="font-medium">Date:</span> {new Date(prescription.prescription_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="mt-4">
                {prescription.is_given ? (
                  <div className="bg-green-100 text-green-800 px-4 py-3 rounded-md text-center flex items-center justify-center">
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Medicine Dispensed
                  </div>
                ) : (
                  <Link
                    href={`/admin/makebill?appointment_id=${prescription.appointment_id}`}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition duration-200 flex items-center justify-center"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Make Bill
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default GiveMedicinePage