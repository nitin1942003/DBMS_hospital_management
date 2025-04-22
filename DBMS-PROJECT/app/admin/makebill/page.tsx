'use client'
import { supabase } from '@/providers/db';
import React, { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

interface Medication {
  name: string;
  dosage: string;
  comments: string;
  duration: string;
  quantity?: number;
  price?: number;
}

interface Test {
  name: string;
  description: string;
}

interface Prescription {
  p_id: string;
  appointment_id: string;
  d_id: string;
  date: string;
  diagnosis: string;
  medication: Medication[];
  tests: Test[];
  to_pharmacist: boolean;
  is_given: boolean;
}

// Component that uses searchParams
function MakeBillContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalBill, setTotalBill] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const appointment_Id = searchParams.get('appointment_id');
    if (appointment_Id) {
      const fetchPrescription = async () => {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from('prescription')
            .select('*')
            .eq('appointment_id', appointment_Id);
          
          if (error) {
            throw error;
          }
          
          if (data && data.length > 0) {
            // Initialize medication with quantity and price fields
            const enhancedData = {
              ...data[0],
              medication: data[0].medication.map((med: Medication) => ({
                ...med,
                quantity: 1,
                price: 0
              }))
            };
            setPrescription(enhancedData);
          }
        } catch (err: any) {
          console.error('Error fetching prescription:', err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      
      fetchPrescription();
    }
  }, []);

  const handleQuantityChange = (index: number, value: number) => {
    if (!prescription) return;
    
    const updatedMedication = [...prescription.medication];
    updatedMedication[index].quantity = value;
    
    setPrescription({
      ...prescription,
      medication: updatedMedication
    });
  };

  const handlePriceChange = (index: number, value: number) => {
    if (!prescription) return;
    
    const updatedMedication = [...prescription.medication];
    updatedMedication[index].price = value;
    
    setPrescription({
      ...prescription,
      medication: updatedMedication
    });
  };

  const calculateTotal = () => {
    if (!prescription) return 0;
    
    const total = prescription.medication.reduce((sum, med) => {
      const quantity = med.quantity || 0;
      const price = med.price || 0;
      return sum + (quantity * price);
    }, 0);
    
    setTotalBill(total);
    return total;
  };

  const handleGenerateBill = async () => {
    if (!prescription) return;
    
    setSubmitting(true);
    try {
      // Calculate final total
      const total = calculateTotal();
      
      // Update prescription to mark as given
      const { error } = await supabase.rpc('update_pharmacy_bill', {
        p_appointment_id: prescription?.appointment_id,
        p_amount: total,
        p_status: 'unpaid',
      });
      
      if (error) {
        console.error('Failed to update pharmacy bill:', error.message);
        throw error;
      }
      
      
      
      // Here you could also save the bill details to a bills table if needed
      
      setSuccess(true);
      
      // Redirect back to give medicine page after 2 seconds
      setTimeout(() => {
        router.push('/admin/givemedicine');
      }, 2000);
      
    } catch (err: any) {
      console.error('Error generating bill:', err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Generate Bill</h1>
      
      {loading && <p className="text-gray-600">Loading prescription details...</p>}
      {error && <p className="text-red-600">Error: {error}</p>}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Bill generated successfully! Redirecting...
        </div>
      )}
      
      {prescription && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="mb-4 pb-4 border-b">
            <h2 className="text-xl font-semibold mb-2">Prescription Details</h2>
            <p className="text-gray-700"><span className="font-medium">Appointment ID:</span> {prescription.appointment_id}</p>
            <p className="text-gray-700"><span className="font-medium">Date:</span> {prescription.date}</p>
            <p className="text-gray-700"><span className="font-medium">Diagnosis:</span> {prescription.diagnosis}</p>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Medications</h3>
            <div className="space-y-3">
              {prescription.medication.map((med, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-md">
                  <p className="font-medium text-blue-700">{med.name}</p>
                  <div className="grid grid-cols-2 gap-2 mt-1 text-sm">
                    <p className="text-gray-600"><span className="font-medium">Dosage:</span> {med.dosage}</p>
                    <p className="text-gray-600"><span className="font-medium">Duration:</span> {med.duration}</p>
                  </div>
                  {med.comments && <p className="text-gray-600 mt-1 italic">{med.comments}</p>}
                  
                  <div className="mt-3 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={med.quantity || 0}
                        onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 0)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price per unit (₹)</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={med.price || 0}
                        onChange={(e) => handlePriceChange(index, parseFloat(e.target.value) || 0)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-2 text-right">
                    <p className="font-medium text-gray-800">
                      Subtotal: ₹{((med.quantity || 0) * (med.price || 0)).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {prescription.tests && prescription.tests.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Tests</h3>
              <div className="space-y-3">
                {prescription.tests.map((test, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-md">
                    <p className="font-medium text-blue-700">{test.name}</p>
                    <p className="text-gray-600 mt-1">{test.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-6 border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Total Bill Amount:</h3>
              <p className="text-xl font-bold text-blue-700">₹{totalBill.toFixed(2)}</p>
            </div>
            
            <div className="flex justify-end space-x-4">
              <button 
                onClick={calculateTotal}
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-md transition duration-200"
                disabled={submitting}
              >
                Calculate Total
              </button>
              
              <button 
                onClick={handleGenerateBill}
                disabled={submitting || totalBill <= 0}
                className={`${
                  submitting || totalBill <= 0 ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                } text-white py-2 px-6 rounded-md transition duration-200 flex items-center`}
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Generate Bill'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Main component with Suspense boundary
const MakeBillPage = () => {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>}>
      <MakeBillContent />
    </Suspense>
  );
};

export default MakeBillPage;