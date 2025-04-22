"use client"
import React, { useState, useEffect } from 'react'
import { supabase } from '@/providers/db'

interface LabAssistant {
  lab_person_id: number;
  name: string;
  lab_type: string;
  license: string;
  mobile_no: string;
}

const RemoveLabAssistantPage = () => {
  const [labAssistants, setLabAssistants] = useState<LabAssistant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [selectedLabAssistant, setSelectedLabAssistant] = useState<LabAssistant | null>(null)

  useEffect(() => {
    fetchLabAssistants()
  }, [])

  const fetchLabAssistants = async () => {
    try {
      const { data, error } = await supabase
        .from('lab_person')
        .select('lab_person_id, name, lab_type, license, mobile_no')
        .order('name')

      if (error) throw error

      setLabAssistants(data || [])
      setLoading(false)
    } catch (err) {
      console.error('Error fetching lab assistants:', err)
      setError('Failed to load lab assistants')
      setLoading(false)
    }
  }

  const handleRemoveLabAssistant = async (labAssistantId: number) => {
    try {
      const { error } = await supabase
        .from('lab_person')
        .delete()
        .eq('lab_person_id', labAssistantId)

      if (error) throw error

      setLabAssistants(labAssistants.filter(assistant => assistant.lab_person_id !== labAssistantId))
      setSuccessMessage('Lab assistant removed successfully')
      setShowConfirmation(false)
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      console.error('Error removing lab assistant:', err)
      setError('Failed to remove lab assistant')
      setShowConfirmation(false)
      setTimeout(() => setError(null), 3000)
    }
  }

  const openConfirmationDialog = (labAssistant: LabAssistant) => {
    setSelectedLabAssistant(labAssistant)
    setShowConfirmation(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⚕️</div>
          <p className="text-gray-600">Loading lab assistants...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Remove Lab Assistant</h1>

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

        {showConfirmation && selectedLabAssistant && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Confirm Removal</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to remove {selectedLabAssistant.name}? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRemoveLabAssistant(selectedLabAssistant.lab_person_id)}
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lab Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {labAssistants.map((assistant) => (
                <tr key={assistant.lab_person_id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{assistant.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{assistant.lab_type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{assistant.license}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{assistant.mobile_no}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => openConfirmationDialog(assistant)}
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

export default RemoveLabAssistantPage