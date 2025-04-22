"use client"
import React, { useEffect, useState } from 'react'
import { supabase } from '@/providers/db'
import { removeSpaces } from '@/lib/removespaces'
import { compareTimes } from '@/lib/comparetimes'
import { checkIfAvailableInTimeSlot } from '@/lib/checkifavailableintimeslot'
interface Doctor {
  d_id: number;
  name: string;
  specialization: string;
  experience: number;
  mobile_no: string;
  email_id: string;
  consult_fees: number;
  schedule: string;
}

interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
}

interface Patient {
  p_id: string;
  // ... other fields
}

const BookAppointmentPage = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>('');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [patient_id, setPatient_id] = useState<Patient | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [slots_booked_error, setSlots_booked_error] = useState<string>('');
  const [inputTime, setInputTime] = useState<string>('');
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [error, setError] = useState<string>('');
  const [selectedTimeObj, setSelectedTimeObj] = useState<Date | null>(null);
  const [currentTimeObj, setCurrentTimeObj] = useState<Date | null>(null);

  const [successMessage, setSuccessMessage] = useState<string>('');
  const [showViewAppointments, setShowViewAppointments] = useState<boolean>(false);

  const daysOfWeek = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];  
  

  const parseSchedule = (schedule: string): TimeSlot[] => {
    try {
      return schedule.split(',').map(slot => {
        const [day, timeRange] = slot.split(' - ');
        const [startTime, endTime] = timeRange.split(' TO ');
        return { day, startTime, endTime };
      });
    } catch (error) {
      console.error('Error parsing schedule:', error);
      return [];
    }
  };

  const generateTimeSlots = (schedule: TimeSlot[]): string[] => {
    const slots: string[] = [];
    try {
      schedule.forEach(slot => {
        const start = new Date(`2000-01-01T${slot.startTime}`);
        const end = new Date(`2000-01-01T${slot.endTime}`);
        
        while (start < end) {
          slots.push(start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
          start.setMinutes(start.getMinutes() + 30); // 30-minute intervals
        }
      });
    } catch (error) {
      console.error('Error generating time slots:', error);
    }
    return slots;
  };

  useEffect(() => {
    if (selectedDoctor) {
      try {
        const schedule = parseSchedule(selectedDoctor.schedule);
        const slots = generateTimeSlots(schedule);
        setAvailableTimeSlots(slots);
      } catch (error) {
        console.error('Error setting available time slots:', error);
        setAvailableTimeSlots([]);
      }
    }
  }, [selectedDoctor]);

  

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    const day = date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
    
    if (selectedDoctor) {
      const schedule = parseSchedule(selectedDoctor.schedule);
      const isDayAvailable = schedule.some(slot => slot.day === day);
      
      if (!isDayAvailable) {
        setError(`Doctor is not available on ${day}`);
        setSelectedDate('');
        setSelectedTime('');
        return;
      }
    }
    const date_date = new Date(e.target.value);
    const day_index = date_date.getDay();
    console.log(daysOfWeek[day_index], "im here");
    setSelectedDay(daysOfWeek[day_index]);
    setSelectedDate(e.target.value);
    setError('');
  };

  const checkTimeAvailability = async () => {
    setSlots_booked_error('');
    setError('');

    console.log(selectedDate, "im here selected date");
    if (!inputTime || !selectedDate || !selectedDoctor) {
      setError('Please select a date and enter a time');
      return false;
    }

    const date = new Date(selectedDate);
    console.log(date, "im here selected date");
    
    
    // Get the doctor's schedule for the selected day
    const schedule = parseSchedule(selectedDoctor.schedule);
    console.log(schedule, "im here");

    let currentDaySchedule = null;
    let startTime = '';
    let endTime = '';
    for(let i = 0; i < schedule.length; i++) {
      if(schedule[i].day === selectedDay){
        console.log(schedule[i].startTime, "im here");
        console.log(schedule[i].endTime, "im here");
        startTime = schedule[i].startTime;
        endTime = schedule[i].endTime;
        currentDaySchedule = schedule[i];
        break;
      }
    }
    
    if (!currentDaySchedule) {
      setError(`Doctor is not available on ${selectedDay}`);
      return false;
    }

    // Convert input time to 24-hour format for comparison
    const inputTimeDate = new Date(`${selectedDate}T${inputTime}`);
    console.log(inputTimeDate, "im here");
    const startTimeDate = new Date(`${selectedDate}T${currentDaySchedule.startTime}`);
    console.log(startTimeDate, "im here");
    const endTimeDate = new Date(`${selectedDate}T${currentDaySchedule.endTime}`);

    const selectedTime = inputTimeDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const selectedTimeWithoutSpaces = removeSpaces(selectedTime);
    console.log(selectedTimeWithoutSpaces, "im here selected time without spaces");
    
    console.log(selectedTime, "im here selected time");
    
    
    // Check if input time is within doctor's schedule
    const currentTime = new Date();
    console.log(currentTime, "im here current time");
    console.log(inputTimeDate, "im here input time date");
    
    // Set the selected and current time objects in state
    setSelectedTimeObj(inputTimeDate);
    setCurrentTimeObj(currentTime);
    console.log("Selected time:", inputTimeDate);
    console.log("Current time:", currentTime);

    // Check if the selected date is today
    const today = new Date();
    console.log(today, "im here today");
    const isToday = date.getDate() === today.getDate() && 
                    date.getMonth() === today.getMonth() && 
                    date.getFullYear() === today.getFullYear();

    // Only check if time is in the past if the selected date is today
    if(isToday && inputTimeDate <= currentTime){
      console.log(currentTime, "im in if");
      setError('Time cannot be in the past');
      return false;
    }

    console.log(selectedTimeWithoutSpaces, "im here selected time without spaces");
    console.log(startTime, "im here start time");
    console.log(endTime, "im here end time");

    if (compareTimes(selectedTimeWithoutSpaces, startTime) < 0 || compareTimes(selectedTimeWithoutSpaces, endTime) >= 0) {
      setError(`Time must be between ${currentDaySchedule.startTime} and ${currentDaySchedule.endTime} on ${selectedDay}`);
      return false;
    }

    // Check if minutes are in 30-minute intervals
    if (inputTimeDate.getMinutes() % 30 !== 0) {
      setError('Please select time in 30-minute intervals (e.g., 10:00, 10:30)');
      return false;
    }

    // Time is valid
    setSelectedTime(inputTimeDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
    setError('');

    const no_of_bookings_in_selected_time_slot = await checkIfAvailableInTimeSlot(selectedDoctor?.d_id?.toString() || '', selectedDate, selectedTime);

    if(no_of_bookings_in_selected_time_slot) {
      if(no_of_bookings_in_selected_time_slot >= 3){
        setError('Time slot is fully booked');
        setSlots_booked_error('Time slot is fully booked');
        console.log("im here, IN");
        return false;
      }
    } 
    return true;

  };

  const bookAppointment = async () => {
    if (!selectedDate || !selectedTime) {
      setError('Please select both date and time');
      return;
    }

    try {
      const { data, error } = await supabase.from('appointment').insert({
        p_id: patient_id?.p_id,
        date: selectedDate,
        time: selectedTime,
        d_id: selectedDoctor?.d_id,
      }).select()
      .single();

      const no_of_bookings_in_selected_time_slot = await checkIfAvailableInTimeSlot(selectedDoctor?.d_id?.toString() || '', selectedDate, selectedTime);

      console.log(no_of_bookings_in_selected_time_slot, "im here no of bookings in selected time slot");

      console.log(data, "im here inserted appointment");
      
      if (error){
        if (error.code === '23505'){
          setError('Appointment already exists');
        }
        else{
          console.log(error, "im here");
          throw error;
        }
      }
      else{
         const {data: data1, error: error1} = await supabase.from('bill').insert({
          appointment_id: data.appointment_id,
          consult_fees: {amount: selectedDoctor?.consult_fees, status: 'unpaid'},
         }).select().single();

         if(!error1) {
           setShowViewAppointments(true);
         }

         console.log(data, "im here inserted appointment");
         console.log(data1, "im here inserted bill");
        setSuccessMessage(`Appointment successfully booked with Dr. ${selectedDoctor?.name} on ${selectedDate} at ${selectedTime}`);
        setError('');
        // Reset selection fields after successful booking
        setSelectedDate('');
        setSelectedTime('');
        setInputTime('');
      }
      
    } catch (error) {
      console.error('Error booking appointment:', error);
      setError('Failed to book appointment');
      setSuccessMessage('');
    }
  };

  const specializations = [
    'Cardiology',
    'Neurology',
    'Pediatrics',
    'Orthopedics',
    'Dermatology',
    'Ophthalmology',
    'ENT',
    'Psychiatry',
    'Dentistry',
    'General Medicine',
    'Gynecology',
    'Urology'
  ];

  const filteredDoctors = selectedSpecialization
    ? doctors.filter(doctor => doctor.specialization === selectedSpecialization)
    : [];

  useEffect(() => {
    const fetchDoctors = async () => {
      const unparsed_patient_id = localStorage.getItem('patientInfo');
      if (unparsed_patient_id) {
        const parsedPatient = JSON.parse(unparsed_patient_id);
        setPatient_id(parsedPatient);
      }
      if (!selectedSpecialization) return;
      
      setLoading(true);
      try {
        const data = await supabase.from('doctor').select('*').eq('specialization', selectedSpecialization);
        if (data.data) {
          setDoctors(data.data as Doctor[]);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching doctors:', error);
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [selectedSpecialization]);

  if (loading && selectedSpecialization) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⚕️</div>
          <p className="text-gray-600">Loading doctors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Book an Appointment</h1>
          <p className="text-gray-600">Select a specialization and choose your preferred doctor</p>
        </div>

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center">
            <span className="mr-2">✅</span>
            <span>{successMessage}</span>
          </div>
        )}

        {showViewAppointments && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="mr-2">ℹ️</span>
                <span>Please go to My Appointments page to view and manage your appointments.</span>
              </div>
              <a href="/patient/myappointments" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200">
                View Appointments
              </a>
            </div>
          </div>
        )}

        {/* Specialization Selection */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Step 1: Select Specialization</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {specializations.map((spec) => (
              <button
                key={spec}
                onClick={() => {
                  setSelectedSpecialization(spec);
                  setSelectedDoctor(null);
                }}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  selectedSpecialization === spec
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                }`}
              >
                <div className="text-2xl mb-2">{getSpecializationEmoji(spec)}</div>
                <span className="font-medium">{spec}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Doctor Selection */}
        {selectedSpecialization && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Step 2: Select Doctor</h2>
            {filteredDoctors.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🔍</div>
                <p className="text-gray-600">No doctors available in this specialization</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredDoctors.map((doctor) => (
                  <div
                    key={doctor.d_id}
                    onClick={() => setSelectedDoctor(doctor)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      selectedDoctor?.d_id === doctor.d_id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{doctor.name}</h3>
                        <p className="text-gray-600">{doctor.experience} years of experience</p>
                      </div>
                      <div className="text-right">
                        <p className="text-purple-600 font-medium">₹{doctor.consult_fees}</p>
                        <p className="text-sm text-gray-500">per consultation</p>
                      </div>
                    </div>
                    {selectedDoctor?.d_id === doctor.d_id && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Available Schedule:</h4>
                        <div className="space-y-2">
                          {parseSchedule(doctor.schedule).map((slot, index) => (
                            <div key={index} className="flex items-center text-sm text-gray-600">
                              <span className="w-24 font-medium">{slot.day}</span>
                              <span>{slot.startTime} - {slot.endTime}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Add after doctor selection */}
        {selectedDoctor && (
          <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Step 3: Select Date & Time</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={handleDateChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              {selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <div className="flex space-x-2">
                    <input
                      type="time"
                      value={inputTime}
                      onChange={(e) => setInputTime(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      step="1800" // 30 minutes in seconds
                    />
                    <button
                      onClick={checkTimeAvailability}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
                    >
                      Check Availability
                    </button>
                  </div>
                  {!slots_booked_error && selectedTime && !error && (
                    <div className="mt-2 text-green-600 text-sm">
                      ✓ Time slot available: {selectedTime}
                    </div>
                  )}
                </div>
              )}
              {error && (
                <div className="text-red-500 text-sm mt-2">
                  {error}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Update the book appointment button */}
        {!slots_booked_error && selectedDoctor && selectedDate && selectedTime && !error && (
          <div className="mt-8 text-center">
            <button
              onClick={bookAppointment}
              className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 font-medium"
            >
              Book Appointment
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const getSpecializationEmoji = (specialization: string): string => {
  const emojiMap: { [key: string]: string } = {
    'Cardiology': '❤️',
    'Neurology': '🧠',
    'Pediatrics': '👶',
    'Orthopedics': '🦴',
    'Dermatology': '🧬',
    'Ophthalmology': '👁️',
    'ENT': '👂',
    'Psychiatry': '🧠',
    'Dentistry': '🦷',
    'General Medicine': '⚕️',
    'Gynecology': '👩‍⚕️',
    'Urology': '🩺'
  };
  return emojiMap[specialization] || '🏥';
};

export default BookAppointmentPage;