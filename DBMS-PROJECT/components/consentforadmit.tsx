"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/providers/db';
import handlebedallotment from '@/lib/handlebedallotment';

interface ConsentForAdmitProps {
  appointmentId: string;
  onClose: () => void;
  location: string;
}

const ConsentForAdmit: React.FC<ConsentForAdmitProps> = ({ appointmentId, onClose, location }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);

  console.log(location, "fsvfszvsa");
  console.log(appointmentId, "appointmentId");


  useEffect(() => {
    
    const fetchConsent = async () => {
      const { data, error } = await supabase
        .from('admit_advise')
        .select('patient_consent')
        .eq('appointment_id', appointmentId)
        .single();
    }
  }, [appointmentId]);

  const handleConsent = async (consent: boolean) => {
    try {
      setLoading(true);
      setError(null);

      // Update the prescription record with patient's consent
      const { data, error } = await supabase.rpc('update_patient_consent', {
        input_appointment_id: appointmentId,
        input_consent: consent,
      });

      try {
        handlebedallotment(appointmentId, location);
      } catch (err: any) {
        console.error('Error allotting bed:', err);
      }
      

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        setShowModal(false);
        onClose();
      }, 2000);

      
    } catch (err: any) {
      console.error('Error updating consent:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    onClose();
  };

  return (
    <>
      <button 
        onClick={() => setShowModal(true)}
        className="text-blue-500 hover:text-blue-700 font-medium underline"
      >
        Respond to Admission Request
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-indigo-700">Hospital Admission Consent</h2>
              <p className="text-gray-600 mt-2">
                Your doctor has recommended hospital admission. Please confirm if you consent to this.
              </p>
            </div>

            {loading && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
                <p className="mt-2 text-indigo-600">Processing your response...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
                <p>Error: {error}</p>
              </div>
            )}

            {success ? (
              <div className="bg-green-50 text-green-600 p-4 rounded-md text-center">
                <p className="font-medium">Your response has been recorded!</p>
                <p className="text-sm mt-1">Closing this window...</p>
              </div>
            ) : (
              <div className="flex flex-col space-y-3 mt-4">
                <button
                  onClick={() => handleConsent(true)}
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md font-medium transition-colors disabled:opacity-50"
                >
                  I Consent to Admission
                </button>
                <button
                  onClick={() => handleConsent(false)}
                  disabled={loading}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md font-medium transition-colors disabled:opacity-50"
                >
                  I Decline Admission
                </button>
                <button
                  onClick={handleClose}
                  disabled={loading}
                  className="text-gray-500 hover:text-gray-700 py-2 px-4 rounded-md font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ConsentForAdmit;