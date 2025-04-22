"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/providers/db';

interface Prescription {
  appointment_id: string;
  p_id: string;
  d_id: string;
  diagnosis: string;
  date: string;
  medication: Array<{
    name: string;
    dosage: string;
    comments: string;
    duration: string;
  }>;
  Tests: Array<{
    name: string;
    description: string;
  }>;
  created_at: string;
  admit_advise?: {
    info: {
      description: string;
      reportingTime: string;
      admissionDate: string;
      dischargeDate: string;
      wardType: string;
      location_id: string;
    },
    patient_consent: string;
  };
}

// Component that uses searchParams
function PrescribeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get('appointmentId');
  const doctorId = searchParams.get('doctorId');    
  const [doctorInfo, setDoctorInfo] = useState<any>(null);
  const [patientInfo, setPatientInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Prescription form state
  const [diagnosis, setDiagnosis] = useState('');
  const [medications, setMedications] = useState([{ name: '', dosage: '', comments: '', duration: '' }]);
  const [tests, setTests] = useState([{ name: '', description: '' }]);
  const [admissionAdvised, setAdmissionAdvised] = useState(false);
  const [admissionNotes, setAdmissionNotes] = useState('');
  const [reportingTime, setReportingTime] = useState('');
  const [admissionDate, setAdmissionDate] = useState('');
  const [dischargeDate, setDischargeDate] = useState('');
  const [wardType, setWardType] = useState('Male General Ward');
  
  const pairs: Record<string, string> = {
    "Female General Ward": "27c2631a-55f9-443b-ac2b-dba264705f71",
    "Male General Ward": "30d28b93-3b3a-44ed-9849-8ac0b32b1102",
    "Maternity Ward": "87b21142-ca66-4472-88b3-0e73c3935c42",
    "Children Ward": "e0642940-f4b4-4b8c-a8ca-e8c41acce6f8"
  }
  
  useEffect(() => {
    // Get doctor info from local storage ✨
    const getDoctorInfo = () => {
      if (typeof window !== 'undefined') {
        const storedDoctorInfo = localStorage.getItem('doctorInfo');
        if (storedDoctorInfo) {
          return JSON.parse(storedDoctorInfo);
        }
      }
      return null;
    };
    
    // Fetch appointment details to get patient info 🔍
    const fetchAppointmentDetails = async (appointmentId: string) => {
      try {
        const { data, error } = await supabase
          .from('appointment')
          .select('*, patients(*)')
          .eq('appointment_id', appointmentId)
          .single();
          
        if (error) throw error;
        if (data) {
          setPatientInfo(data.patients);
        }
      } catch (err: any) {
        console.error('Error fetching appointment details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    const doctor = getDoctorInfo();
    if (doctor && doctor.d_id) {
      setDoctorInfo(doctor);
    } else {
      setError('👨‍⚕️ Doctor information not found. Please log in again.');
    }
    
    if (appointmentId) {
      fetchAppointmentDetails(appointmentId);
    } else {
      setError('🔍 Appointment ID is required');
      setLoading(false);
    }
  }, [appointmentId]);
  
  // Add more medication fields
  const addMedication = () => {
    setMedications([...medications, { name: '', dosage: '', comments: '', duration: '' }]);
  };
  
  // Remove medication field
  const removeMedication = (index: number) => {
    if (medications.length > 1) {
      const updatedMedications = [...medications];
      updatedMedications.splice(index, 1);
      setMedications(updatedMedications);
    }
  };
  
  // Add more test fields
  const addTest = () => {
    setTests([...tests, { name: '', description: '' }]);
  };
  
  // Remove test field
  const removeTest = (index: number) => {
    if (tests.length > 1) {
      const updatedTests = [...tests];
      updatedTests.splice(index, 1);
      setTests(updatedTests);
    }
  };
  
  // Handle medication field changes
  const handleMedicationChange = (index: number, field: string, value: string) => {
    const updatedMedications = [...medications];
    updatedMedications[index] = { ...updatedMedications[index], [field]: value };
    setMedications(updatedMedications);
  };
  
  // Handle test field changes
  const handleTestChange = (index: number, field: string, value: string) => {
    const updatedTests = [...tests];
    updatedTests[index] = { ...updatedTests[index], [field]: value };
    setTests(updatedTests);
  };
  
  // Submit prescription
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!doctorInfo || !patientInfo || !appointmentId) {
      setError('⚠️ Missing required information');
      return;
    }
    
    try {
      setLoading(true);
      
      const prescription: Prescription = {
        appointment_id: appointmentId,
        p_id: patientInfo.p_id,
        d_id: doctorInfo.d_id,
        diagnosis,
        date: new Date().toISOString().split('T')[0],
        medication: medications.map(med => ({
          name: med.name,
          dosage: med.dosage,
          comments: med.comments,
          duration: med.duration
        })),
        Tests: tests,
        created_at: new Date().toISOString(),
      };
      
      // Add admit_advise data if admission is advised
      if (admissionAdvised) {
        prescription.admit_advise = {
          info: {
            description: admissionNotes,
            reportingTime: reportingTime,
            admissionDate: admissionDate,
            dischargeDate: dischargeDate,
            wardType: wardType,
            location_id: pairs[wardType]
          },
          patient_consent: "pending"
        };
      }
      
      const { data, error } = await supabase
        .from('prescription')
        .insert(prescription)
        .select();
        
      if (error) throw error;

      if(data){
        const {data: data1, error: error1} = await supabase.from('appointment').update({attended_flag: true}).eq('appointment_id', appointmentId).select().single();
        if(error1) throw error1;
      }
      
      setSuccess(true);
      setTimeout(() => {
        router.push('/doctor/appointments');
      }, 2000);
      
    } catch (err: any) {
      console.error('Error creating prescription:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) return <div className="p-8 text-center">⏳ Loading your prescription form...</div>;
  if (error) return <div className="p-8 text-center text-red-500">❌ Error: {error}</div>;
  if (success) return <div className="p-8 text-center text-green-500">✅ Prescription created successfully! Redirecting...</div>;
  
  return (
    <div className="p-6 bg-gradient-to-b from-indigo-50 to-white min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-center text-indigo-700">✨ Create Prescription ✨</h1>
      
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto border border-indigo-100">
        <div className="mb-6 p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-500">
          <h2 className="text-xl font-semibold mb-2 flex items-center">
            <span className="mr-2">👤</span>Patient Information
          </h2>
          <p><span className="font-medium">Name:</span> {patientInfo?.name || '🕵️ Unknown Patient'}</p>
          <p><span className="font-medium">dob:</span> {patientInfo?.dob || '🕵️ Unknown dob'}</p>
          <p><span className="font-medium">gender:</span> {patientInfo?.gender || '🕵️ Unknown gender'}</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              <span className="mr-2">🔍</span>Diagnosis
            </label>
            <textarea 
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={4}
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="Enter your diagnosis here..."
            />
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium flex items-center">
                <span className="mr-2">💊</span>Medications
              </h3>
              <button 
                type="button" 
                onClick={addMedication}
                className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full hover:bg-indigo-200 transition-colors flex items-center"
              >
                <span className="mr-1">+</span> Add Medication
              </button>
            </div>
            
            {medications.map((med, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg mb-4 hover:border-indigo-300 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-sm font-medium text-gray-700">Medication #{index + 1}</h4>
                  {medications.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => removeMedication(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      <span>❌ Remove</span>
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      <span className="mr-1">🏷️</span>Medicine Name
                    </label>
                    <input 
                      type="text" 
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      value={med.name}
                      onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                      placeholder="e.g., Paracetamol"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      <span className="mr-1">⚖️</span>Dosage
                    </label>
                    <input 
                      type="text" 
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      value={med.dosage}
                      onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                      placeholder="e.g., 500mg twice daily"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      <span className="mr-1">📝</span>Comments
                    </label>
                    <input 
                      type="text" 
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      value={med.comments}
                      onChange={(e) => handleMedicationChange(index, 'comments', e.target.value)}
                      placeholder="e.g., Take after meals"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      <span className="mr-1">⏱️</span>Duration
                    </label>
                    <input 
                      type="text" 
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      value={med.duration}
                      onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                      placeholder="e.g., 7 days"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium flex items-center">
                <span className="mr-2">🔬</span>Tests
              </h3>
              <button 
                type="button" 
                onClick={addTest}
                className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full hover:bg-indigo-200 transition-colors flex items-center"
              >
                <span className="mr-1">+</span> Add Test
              </button>
            </div>
            
            {tests.map((test, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg mb-4 hover:border-indigo-300 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-sm font-medium text-gray-700">Test #{index + 1}</h4>
                  {tests.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => removeTest(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      <span>❌ Remove</span>
                    </button>
                  )}
                </div>
                <div className="mb-3">
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    <span className="mr-1">🧪</span>Test Name
                  </label>
                  <input 
                    type="text" 
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={test.name}
                    onChange={(e) => handleTestChange(index, 'name', e.target.value)}
                    placeholder="e.g., Blood Test"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    <span className="mr-1">📋</span>Description
                  </label>
                  <textarea 
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    rows={2}
                    value={test.description}
                    onChange={(e) => handleTestChange(index, 'description', e.target.value)}
                    placeholder="Additional details about the test..."
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="mb-8 p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors">
            <h3 className="text-lg font-medium flex items-center mb-3">
              <span className="mr-2">🏥</span>Hospital Admission
            </h3>
            <div className="mb-3">
              <label className="flex items-center text-gray-700 font-medium cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={admissionAdvised}
                  onChange={(e) => setAdmissionAdvised(e.target.checked)}
                  className="mr-2 h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                Advise hospital admission
              </label>
            </div>
            {admissionAdvised && (
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  <span className="mr-1">📝</span>Admission Notes
                </label>
                <textarea 
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none mb-3"
                  rows={3}
                  value={admissionNotes}
                  onChange={(e) => setAdmissionNotes(e.target.value)}
                  placeholder="Reason for admission, special instructions, etc."
                />
                
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      <span className="mr-1">⏰</span>Reporting Time
                    </label>
                    <input 
                      type="time" 
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      value={reportingTime}
                      onChange={(e) => setReportingTime(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      <span className="mr-1">📅</span>Admission Date
                    </label>
                    <input 
                      type="date" 
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      value={admissionDate}
                      onChange={(e) => setAdmissionDate(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="mb-3">
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    <span className="mr-1">📅</span>Expected Discharge Date
                  </label>
                  <input 
                    type="date" 
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={dischargeDate}
                    onChange={(e) => setDischargeDate(e.target.value)}
                  />
                </div>
                
                <div className="mb-3">
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    <span className="mr-1">🛏️</span>Ward Type
                  </label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={wardType}
                    onChange={(e) => setWardType(e.target.value)}
                  >
                    <option value="Male General Ward">Male General Ward</option>
                    <option value="Female General Ward">Female General Ward</option>
                    <option value="Maternity Ward">Maternity Ward</option>
                    <option value="Children Ward">Children Ward</option>
                  </select>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="mr-4 px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors flex items-center"
            >
              <span className="mr-1">↩️</span> Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
              disabled={loading}
            >
              {loading ? '⏳ Submitting...' : '✅ Create Prescription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
const PrescribePage = () => {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading prescription page...</div>}>
      <PrescribeContent />
    </Suspense>
  );
};

export default PrescribePage;