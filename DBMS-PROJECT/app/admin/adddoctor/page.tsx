// pages/admin/add-doctor.tsx
"use client"
import { useEffect, useState } from 'react';

import { supabase } from '@/providers/db';
import { removeSpaces } from '@/lib/removespaces';
import { updateLocationStatus } from '@/lib/updatelocationstatus';  
// Create Supabase client

const DAYS_OF_WEEK = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

export default function AddDoctor() {
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });
  
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    specialization: '',
    experience: '',
    mobile_no: '',
    email_id: '',
    password: '',
    schedule: '',
    consult_fees: '',
    name: '',
    login_id: '',
    location_id: '',
  });

  // State for current schedule entry
  const [currentDay, setCurrentDay] = useState('MONDAY');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [scheduleEntries, setScheduleEntries] = useState<string[]>([]);
  
  const [admin_id, setAdmin_id] = useState<string>('');
  const [dontAllowSubmit, setDontAllowSubmit] = useState<boolean>(false);
  const [available_rooms, setAvailableRooms] = useState<any[]>([]);
  const [selected_room_id, setSelectedRoomId] = useState<string>('');
  // Emoji mapping for specializations
  const specializationEmojis: Record<string, string> = {
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
    'Urology': '🩺',
    'Other': '🏥'
  };

  useEffect(() => {
    const unparsed_admin_id = localStorage.getItem('adminInfo');
    if (unparsed_admin_id) {
      const admin = JSON.parse(unparsed_admin_id);
      const admin_id = admin.admin_id;

      setAdmin_id(admin_id);  
      console.log(admin_id, "im here");
    }
    
  }, []);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if(name === 'room_id'){
      const room_id = value;
      setFormData(prev => ({ ...prev, location_id: room_id }));
      console.log(room_id, "im here room id");
      setSelectedRoomId(room_id);
    }

    if(name === 'specialization'){

      const get_rooms = async () => {
        const { data, error } = await supabase
          .from('location')
          .select('*')
          .eq('department', value)
          .eq('room_type', 'OPD')
          .eq('alloted', 'NO');
        return data;
      }

      const rooms_of_selected_specialization = await get_rooms();


      if(rooms_of_selected_specialization){
        setAvailableRooms(rooms_of_selected_specialization);
      }
      console.log(rooms_of_selected_specialization, "im here rooms");

      
      
      const doctors_with_selected_specialization = await supabase
        .from('doctor')
        .select('*')
        .eq('specialization', value);
      if(doctors_with_selected_specialization.data){
        const no_of_doctors_with_selected_specialization = doctors_with_selected_specialization.data.length;
        if(no_of_doctors_with_selected_specialization >= 3){
          alert('Only 3 doctors are allowed for this specialization');
          setDontAllowSubmit(true);
          return;
        }
      }
    }
  };

  

  const formatTimeWithLeadingZero = (time: string): string => {
    // Check if the time starts with a single digit hour
    const timeRegex = /^(\d):(.+)$/;
    const match = time.match(timeRegex);
    
    if (match) {
      // Add leading zero to the hour
      return `0${match[1]}:${match[2]}`;
    }
    
    return time;
  };

  const validateAndFormatTime = (time: string): string | null => {
    // Remove all spaces
    const cleanTime = removeSpaces(time);
    
    // Check if time contains AM or PM (case insensitive)
    if (!/(am|pm)$/i.test(cleanTime)) {
      return null;
    }
    
    // Convert am/pm to AM/PM
    let formattedTime = formatTimeWithLeadingZero(cleanTime);
    formattedTime = formattedTime.replace(/am$/i, 'AM').replace(/pm$/i, 'PM');
    
    return formattedTime;
  };

  const addScheduleEntry = () => {
    if (!startTime || !endTime) {
      alert('Please enter both start and end times');
      return;
    }

    // Format and validate times
    const formattedStartTime = validateAndFormatTime(startTime);
    const formattedEndTime = validateAndFormatTime(endTime);

    if (!formattedStartTime || !formattedEndTime) {
      alert('Time must include AM or PM');
      return;
    }

    const entry = `${currentDay} - ${formattedStartTime} TO ${formattedEndTime}`;
    setScheduleEntries(prev => [...prev, entry]);
    setFormData(prev => ({ ...prev, schedule: [...prev.schedule ? prev.schedule.split(', ') : [], entry].join(', ') }));
    
    // Reset inputs for next entry
    setStartTime('');
    setEndTime('');
  };

  const removeScheduleEntry = (indexToRemove: number) => {
    const newEntries = scheduleEntries.filter((_, index) => index !== indexToRemove);
    setScheduleEntries(newEntries);
    setFormData(prev => ({ ...prev, schedule: newEntries.join(', ') }));
  };

  const generateLoginId = () => {
    // Generate a random 6-character alphanumeric string
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();
    
    if(dontAllowSubmit){
      setDontAllowSubmit(false);
      alert('Only 3 doctors are allowed for this specialization');
      return;
    }
   
    setLoading(true);
    
    try {
      // Generate login_id before submission
      const login_id = generateLoginId();

      // Convert numeric fields to appropriate types
      const processedData = {
        ...formData,
        age: parseInt(formData.age),
        experience: parseInt(formData.experience),
        mobile_no: formData.mobile_no,
        consult_fees: parseInt(formData.consult_fees),
        login_id,
        admin_id
      };
      
      const { data, error } = await supabase
        .from('doctor')
        .insert([
          {
            name: processedData.name,
            age: processedData.age,
            gender: processedData.gender,
            specialization: processedData.specialization,
            experience: processedData.experience,
            mobile_no: processedData.mobile_no,
            email_id: processedData.email_id,
            password: processedData.password,
            schedule: processedData.schedule,
            consult_fees: processedData.consult_fees,
            login_id: processedData.login_id,
            location_id: processedData.location_id,
            admin_id: processedData.admin_id
          }
        ]);
        
      if (error) {
        console.log(error, "im here error");
        throw error;
      }
      else {
        console.log(data, "im here after data insertion");
        const location_id = selected_room_id;
        const updated_location = await updateLocationStatus(location_id);
        console.log(updated_location, "im here updated location");

        // Remove the selected room from available rooms after successful submission
        setAvailableRooms(prev => prev.filter(room => room.location_id !== selected_room_id));
        setSelectedRoomId('');
      }
      
      setMessage({ 
        type: 'success', 
        content: `✅ Doctor added successfully! Login ID: ${login_id}` 
      });
      
      // Reset form after successful submission
     /* setFormData({
        name: '',
        age: '',
        gender: '',
        specialization: '',
        experience: '',
        mobile_no: '',
        email_id: '',
        password: '',
        schedule: '',
        consult_fees: '',
        login_id: '',
        location_id: '',
      });*/
      
      setScheduleEntries([]);
      
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        content: `❌ Error: ${error.message}` 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-purple-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column - Form Title and Info */}
          <div className="lg:w-1/3">
            <div className="sticky top-8 bg-white rounded-xl p-8 shadow-lg">
              <h1 className="text-3xl font-bold text-blue-800 mb-4">
                🩺 Add New Doctor
              </h1>
              <p className="text-gray-600 mb-6">
                Complete the form to add a new healthcare professional to the database.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-indigo-700">
                  <span className="text-2xl">📋</span>
                  <span>All fields are mandatory</span>
                </div>
                <div className="flex items-center gap-3 text-indigo-700">
                  <span className="text-2xl">🔒</span>
                  <span>Data is securely stored in Supabase</span>
                </div>
                <div className="flex items-center gap-3 text-indigo-700">
                  <span className="text-2xl">📱</span>
                  <span>Mobile number should be without country code</span>
                </div>
              </div>
              
              {message.content && (
                <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  <p className="mb-4">{message.content.split('Login ID:')[0]}</p>
                  {message.type === 'success' && message.content.includes('Login ID:') && (
                    <div className="space-y-3">
                      <div className="bg-white p-4 rounded-lg border-2 border-green-200">
                        <p className="text-sm text-gray-600 mb-2">Doctor's Login Credentials:</p>
                        <div className="flex items-center justify-between bg-green-50 p-3 rounded">
                          <div>
                            <p className="font-medium">Login ID:</p>
                            <p className="text-xl font-bold text-green-700">{message.content.split('Login ID: ')[1]}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(message.content.split('Login ID: ')[1]);
                              alert('Login ID copied to clipboard!');
                            }}
                            className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                            title="Copy Login ID"
                          >
                            📋
                          </button>
                        </div>
                      </div>
                      <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                        <div className="flex gap-2 items-start">
                          <span className="text-yellow-600">⚠️</span>
                          <div className="text-sm text-yellow-800">
                            <p className="font-medium">Important:</p>
                            <p>Please save or share this Login ID with the doctor. It will be required for accessing the system.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Right Column - Form */}
          <div className="lg:w-2/3">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl p-8 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Name */}
                <div className="form-group md:col-span-2">
                  <label className="block text-gray-700 mb-2" htmlFor="name">
                    👤 Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter doctor's full name"
                  />
                </div>
                
                {/* Age */}
                <div className="form-group">
                  <label className="block text-gray-700 mb-2" htmlFor="age">
                    🧓 Age
                  </label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    required
                    min="18"
                    max="100"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter age"
                  />
                </div>
                
                {/* Gender */}
                <div className="form-group">
                  <label className="block text-gray-700 mb-2" htmlFor="gender">
                    👤 Gender
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
                
                {/* Specialization */}
                <div className="form-group">
                  <label className="block text-gray-700 mb-2" htmlFor="specialization">
                    🏥 Specialization
                  </label>
                  <select
                    id="specialization"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select specialization</option>
                    {Object.entries(specializationEmojis).map(([spec, emoji]) => (
                      <option key={spec} value={spec}>
                        {emoji} {spec}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Experience */}
                <div className="form-group">
                  <label className="block text-gray-700 mb-2" htmlFor="experience">
                    🗓️ Experience (years)
                  </label>
                  <input
                    type="number"
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    required
                    min="0"
                    max="70"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Years of experience"
                  />
                </div>
                
                {/* Mobile Number */}
                <div className="form-group">
                  <label className="block text-gray-700 mb-2" htmlFor="mobile_no">
                    📱 Mobile Number
                  </label>
                  <input
                    type="text"
                    id="mobile_no"
                    name="mobile_no"
                    value={formData.mobile_no}
                    onChange={handleChange}
                    required
                    pattern="[0-9]+"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Mobile number without country code"
                  />
                </div>
                
                {/* Email */}
                <div className="form-group">
                  <label className="block text-gray-700 mb-2" htmlFor="email_id">
                    ✉️ Email Address
                  </label>
                  <input
                    type="email"
                    id="email_id"
                    name="email_id"
                    value={formData.email_id}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="doctor@example.com"
                  />
                </div>
                
                {/* Password */}
                <div className="form-group">
                  <label className="block text-gray-700 mb-2" htmlFor="password">
                    🔒 Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter password (min 6 characters)"
                  />
                </div>
                
                {/* Consultation Fees */}
                <div className="form-group">
                  <label className="block text-gray-700 mb-2" htmlFor="consult_fees">
                    💰 Consultation Fees
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500">$</span>
                    <input
                      type="number"
                      id="consult_fees"
                      name="consult_fees"
                      value={formData.consult_fees}
                      onChange={handleChange}
                      required
                      min="0"
                      className="w-full p-3 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Consultation fee amount"
                    />
                  </div>
                </div>

                {/* Allot Room */}
                <div className="form-group">
                  <label className="block text-gray-700 mb-2" htmlFor="room_id">
                    🏠 Allot Room
                  </label>
                  <select
                    id="room_id"
                    name="room_id"
                    value={selected_room_id}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Room</option>
                    {available_rooms.map((room) => (
                      <option key={room.location_id} value={room.location_id}>
                        Room {room.room_no} - {room.room_type}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Schedule - Simple Input with Add Button */}
                <div className="form-group md:col-span-2">
                  <label className="block text-gray-700 mb-2">
                    🕒 Working Schedule
                  </label>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 mb-3">Format: 'MONDAY - 9:00AM TO 5:00PM'</p>

                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Day</label>
                        <select
                          value={currentDay}
                          onChange={(e) => setCurrentDay(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg"
                        >
                          {DAYS_OF_WEEK.map(day => (
                            <option key={day} value={day}>{day}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Start Time</label>
                        <input
                          type="text"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          placeholder="e.g., 09:00AM"
                          className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">End Time</label>
                        <input
                          type="text"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          placeholder="e.g., 05:00PM"
                          className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={addScheduleEntry}
                      className="w-full p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      ➕ Add Schedule Entry
                    </button>
                    
                    {/* Display current schedule entries */}
                    {scheduleEntries.length > 0 && (
                      <div className="mt-4 border-t border-gray-200 pt-4">
                        <h4 className="font-medium text-gray-800 mb-2">📅 Current Schedule:</h4>
                        <ul className="space-y-2">
                          {scheduleEntries.map((entry, index) => (
                            <li key={index} className="flex justify-between items-center bg-white p-2 rounded border border-gray-200">
                              <span>{entry}</span>
                              <button
                                type="button"
                                onClick={() => removeScheduleEntry(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                Remove
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <input
                    type="hidden"
                    name="schedule"
                    value={formData.schedule}
                    required
                  />
                </div>
              </div>
              
              <div className="mt-8 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      name: '',
                      age: '',
                      gender: '',
                      specialization: '',
                      experience: '',
                      mobile_no: '',
                      email_id: '',
                      password: '',
                      schedule: '',
                      consult_fees: '',
                      login_id: '',
                      location_id: '',
                    });
                    
                    setScheduleEntries([]);
                    setStartTime('');
                    setEndTime('');
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  🔄 Reset Form
                </button>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  {loading ? '⏳ Processing...' : '✅ Add Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}