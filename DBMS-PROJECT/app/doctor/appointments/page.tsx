"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/providers/db';
import Link from 'next/link';

interface Appointment {
  appointment_id: string;
  date: string;
  time: string;
  patients: {
    name: string;
  };
  bill: {
    appointment_id: string;
    consult_fees: {
      amount: number;
      status: string;
    };
  }
  attended_flag: boolean;
}

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [doctorInfo, setDoctorInfo] = useState<any>(null);
  const [showUpcoming, setShowUpcoming] = useState(false);

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

    const fetchAppointments = async (doctorId: string) => {
      try {
        // 🔍 Fetching your appointments...
        const { data, error } = await supabase
          .from('appointment')
          .select('appointment_id, date, time, patients(p_id, name), attended_flag, bill(appointment_id, consult_fees)')
          .eq('d_id', doctorId)
          .order('date', { ascending: true })
          .order('time', { ascending: true });

        if (error) throw error;
        setAppointments(data || []);
      } catch (err: any) {
        console.error('Error fetching appointments:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const doctor = getDoctorInfo();
    if (doctor && doctor.d_id) {
      setDoctorInfo(doctor);
      fetchAppointments(doctor.d_id);
    } else {
      setError('👨‍⚕️ Doctor information not found. Please log in again.');
      setLoading(false);
    }
  }, []);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Attended':
        return 'bg-green-100 text-green-800';
      case 'Not Attended':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
        case 'TRUE':
        return '✅';
      case 'FALSE':
        return '⏳';
      case 'CANCELLED':
        return '❌';
      default:
        return '⏳';
    }
  };

  const filterAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    
    if (showUpcoming) {
      // Show upcoming appointments (future dates only, not today)
      return appointments.filter((appointment: Appointment) => 
        appointment.date > today
      );
    } else {
      // Show only today's appointments
      return appointments.filter((appointment: Appointment) => 
        appointment.date === today
      );
    }
  };

  const filteredAppointments = filterAppointments();
  const attendedAppointments = filteredAppointments.filter((appointment: Appointment) => appointment.attended_flag);
  const notAttendedAppointments = filteredAppointments.filter((appointment: Appointment) => !appointment.attended_flag);

  if (loading) return <div className="p-8 text-center">⏳ Loading your appointments...</div>;
  if (error) return <div className="p-8 text-center text-red-500">❌ Error: {error}</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-4 text-center text-indigo-700">
        {showUpcoming ? "✨ All Upcoming Appointments ✨" : "✨ Today's Appointments ✨"}
      </h1>
      
      <div className="flex justify-center mb-6">
        <button 
          onClick={() => setShowUpcoming(!showUpcoming)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
        >
          {showUpcoming ? "Show Today's Appointments" : "Show Upcoming Appointments"}
        </button>
      </div>
      
      {filteredAppointments.length === 0 ? (
        <div className="text-center p-8 bg-white rounded-xl shadow-md max-w-lg mx-auto">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-xl text-gray-700">No appointments found.</p>
          <p className="text-lg text-indigo-600 mt-2">Enjoy your free time! 🎉</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Not Attended Appointments Section */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-indigo-600 border-b pb-2">
              ⏳ Pending Appointments ({notAttendedAppointments.length})
            </h2>
            
            {notAttendedAppointments.length === 0 ? (
              <div className="text-center p-4 bg-white rounded-lg">
                <p className="text-gray-600">No pending appointments</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 max-w-2xl mx-auto">
                {notAttendedAppointments.map((appointment: Appointment) => (
                  <div 
                    key={appointment.appointment_id} 
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                          <span className="mr-2">👤</span>
                          {appointment.patients?.name || '🕵️ Unknown Patient'}
                        </h2>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor('Not Attended')}`}>
                          {getStatusIcon('FALSE')} Not Attended
                        </span>
                      </div>
                      
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center text-gray-700">
                          <span className="mr-2 text-lg">📅</span>
                          <span>{appointment.date}</span>
                        </div>
                        
                        <div className="flex items-center text-gray-700">
                          <span className="mr-2 text-lg">⏰</span>
                          <span>{appointment.time}</span>
                        </div>
                      </div>
                      
                      <div className="mt-6 pt-4 border-t border-gray-100">
                        {appointment.bill?.consult_fees?.status === 'unpaid' ? (
                          <div className="w-full bg-red-100 text-red-700 py-2 px-4 rounded-lg text-center">
                            💰 Fees Unpaid
                          </div>
                        ) : (
                          <Link href={`/doctor/prescribe?appointmentId=${appointment.appointment_id}&doctorId=${doctorInfo.d_id}`} className="block w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-2 px-4 rounded-lg text-center transition-colors duration-200">
                              Prescribe
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Attended Appointments Section */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-green-600 border-b pb-2">
              ✅ Completed Appointments ({attendedAppointments.length})
            </h2>
            
            {attendedAppointments.length === 0 ? (
              <div className="text-center p-4 bg-white rounded-lg">
                <p className="text-gray-600">No completed appointments</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 max-w-2xl mx-auto">
                {attendedAppointments.map((appointment: Appointment) => (
                  <div 
                    key={appointment.appointment_id} 
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                          <span className="mr-2">👤</span>
                          {appointment.patients?.name || '🕵️ Unknown Patient'}
                        </h2>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor('Attended')}`}>
                          {getStatusIcon('TRUE')} Attended
                        </span>
                      </div>
                      
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center text-gray-700">
                          <span className="mr-2 text-lg">📅</span>
                          <span>{appointment.date}</span>
                        </div>
                        
                        <div className="flex items-center text-gray-700">
                          <span className="mr-2 text-lg">⏰</span>
                          <span>{appointment.time}</span>
                        </div>
                      </div>
                      
                      <div className="mt-6 pt-4 border-t border-gray-100">
                        <button className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors duration-200">
                          Attended
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;