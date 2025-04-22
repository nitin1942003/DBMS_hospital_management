'use client'
import React, { useEffect, useState } from 'react'
import { supabase } from '@/providers/db';
import Link from 'next/link';
import ConsentForAdmit from '@/components/consentforadmit';


// 📋 Define appointment data structure
interface Appointment {
  appointment_id: string;
  date: string;
  time: string;
  doctor: {
    name: string;
    specialization: string;
  };
  bill: {
    appointment_id: string;
    consult_fees: {
      status: string;
    };
    pharmacy_bill?: {
      status: string;
    };
  };
  attended_flag: boolean;
    prescription: {
    appointment_id: string;
    admit_advise: {
      info: {
        description: string;
        ward_Type: string;
        location_id: string;
      },
      patient_consent: string;
    };
  };
}

interface Bill {
  bill_id: string;
  appointment_id: string;
  amount: number;
  status: string;
}

const MyAppointments = () => {
  // 🎯 State management
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  

  

  // 🔄 Fetch appointments on component mount
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        // 🔑 Get patient authentication info
        const unparsedPatientInfo = localStorage.getItem('patientInfo');
        const patientInfo = JSON.parse(unparsedPatientInfo || '{}');
        console.log('👤 Patient Info:', patientInfo);
        if (!patientInfo) {
          throw new Error('🚫 Patient info not found');
        }
        
        // 📥 Fetch appointments from database
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from('appointment')
          .select('appointment_id, date, time, doctor(name, specialization), bill(appointment_id, consult_fees, pharmacy_bill), attended_flag, prescription(appointment_id, admit_advise)')
          .eq('p_id', patientInfo.p_id);
        
        console.log(appointmentsData, "appointmentsData from supabase");

        if (appointmentsError) throw appointmentsError;

       
        
        console.log('📅 Appointments:', appointmentsData);
        if (appointmentsData) { 
          setAppointments(appointmentsData as unknown as Appointment[]);
        }
        

      } catch (err) {
        setError(err instanceof Error ? err.message : '❌ Failed to load appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // ⏳ Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // ⚠️ Error state
  if (error) {
    return (
      <div className="max-w-3xl mx-auto mt-10 p-6 bg-red-50 rounded-lg border border-red-200">
        <div className="text-red-500 text-center p-4 flex flex-col items-center">
          <span className="text-4xl mb-2">⚠️</span>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // 🎨 Render appointments
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl shadow-lg p-6 mb-8">
        <h1 className="text-3xl font-bold text-center text-purple-800 mb-2">📋 My Appointments</h1>
        <p className="text-center text-gray-600">Your upcoming medical consultations</p>
      </div>
      
      {appointments.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-gray-600 text-lg">No appointments found.</p>
          <p className="text-gray-500 mt-2">Book a new appointment to get started!</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {appointments.map((appointment, index) => (
            <div 
              key={index}
              className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex flex-col md:flex-row justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold text-purple-800">
                    <span className="mr-2">👨‍⚕️</span>
                    {appointment.doctor.name}
                  </h2>
                  <p className="text-indigo-600 font-medium mt-1">
                    <span className="mr-2">🏥</span>
                    {appointment.doctor.specialization}
                  </p>
                  <div className="mt-4 bg-purple-50 p-3 rounded-md">
                    <p className="text-gray-700 flex items-center">
                      <span className="text-purple-700 mr-2">📅</span>
                      <span className="font-medium">Date:</span> 
                      <span className="ml-2">{new Date(appointment.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                    </p>
                    <p className="text-gray-700 flex items-center mt-2">
                      <span className="text-purple-700 mr-2">⏰</span>
                      <span className="font-medium">Time:</span>
                      <span className="ml-2">{appointment.time}</span>
                    </p>
                  </div>
                  {appointment.bill.consult_fees.status === 'unpaid' ? (
                    <Link href={`/feepayment?appointment_id=${appointment.bill.appointment_id}`} className='text-blue-500'>Pay Now </Link>
                  ) : (
                    <div className='text-blue-500'>
                      Paid
                    </div>
                  )}
                  {appointment.bill.pharmacy_bill && appointment.bill.pharmacy_bill.status === 'unpaid' && (
                    <div className="mt-2">
                      <Link href={`/feepayment?appointment_id=${appointment.bill.appointment_id}&type=pharmacy`} className='text-blue-500'>
                        Pay Pharmacy Bill
                      </Link>
                    </div>
                  )}
                </div>
                  {appointment.attended_flag === true && (
                  <div className='text-blue-500'>
                    <Link href={`/patient/viewprescription?appointment_id=${appointment.appointment_id}`}>view prescription</Link>
                  </div>
                )}
                
              </div>
              {appointment.prescription && appointment.prescription.admit_advise && appointment.prescription.admit_advise.patient_consent === 'pending' && appointment.prescription.admit_advise.info.location_id && (
                  <div className='text-blue-500'>
                      <ConsentForAdmit appointmentId={appointment.appointment_id} onClose={() => {}} location={appointment.prescription.admit_advise.info.location_id} />
                  </div>
                )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyAppointments