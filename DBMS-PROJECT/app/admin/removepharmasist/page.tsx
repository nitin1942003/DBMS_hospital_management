"use client"
import React, { useState, useEffect } from 'react'
import { supabase } from '@/providers/db'

interface Pharmacist {
  pharmacist_id: string; // Changed to string for UUID
  name: string;
  gender: string;
  license: string; // Changed from license_no to license
  mobile_no: string;
  admin_id: string;
  created_at: string;
  pharmacist_login_id: string;
  password: string;
}

const RemovePharmacistPage = () => {
  const [pharmacists, setPharmacists] = useState<Pharmacist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [selectedPharmacist, setSelectedPharmacist] = useState<Pharmacist | null>(null)

  useEffect(() => {
    fetchPharmacists()
  }, [])

  const fetchPharmacists = async () => {
    try {
      const { data, error } = await supabase
        .from('pharmacist')
        .select('pharmacist_id, name, gender, license, mobile_no, admin_id, created_at, pharmacist_login_id, password')
        .order('name')

      if (error) throw error

      setPharmacists(data || [])
      setLoading(false)
    } catch (err) {
      console.error('Error fetching pharmacists:', err)
      setError('Failed to load pharmacists')
      setLoading(false)
    }
  }

  const handleRemovePharmacist = async (pharmacistId: string) => {
    try {
      const { error } = await supabase
        .from('pharmacist')
        .delete()
        .eq('pharmacist_id', pharmacistId)

      if (error) throw error

      setPharmacists(pharmacists.filter(pharmacist => pharmacist.pharmacist_id !== pharmacistId))
      setSuccessMessage('Pharmacist removed successfully')
      setShowConfirmation(false)
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      console.error('Error removing pharmacist:', err)
      setError('Failed to remove pharmacist')
      setShowConfirmation(false)
      setTimeout(() => setError(null), 3000)
    }
  }

  const openConfirmationDialog = (pharmacist: Pharmacist) => {
    setSelectedPharmacist(pharmacist)
    setShowConfirmation(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⚕️</div>
          <p className="text-gray-600">Loading pharmacists...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Remove Pharmacist</h1>

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

        {showConfirmation && selectedPharmacist && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Confirm Removal</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to remove {selectedPharmacist.name}? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRemovePharmacist(selectedPharmacist.pharmacist_id)}
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pharmacists.map((pharmacist) => (
                <tr key={pharmacist.pharmacist_id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{pharmacist.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pharmacist.gender}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pharmacist.license}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pharmacist.mobile_no}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => openConfirmationDialog(pharmacist)}
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

export default RemovePharmacistPage