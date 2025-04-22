// pages/admin/add-lab-assistant.tsx
"use client"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/providers/db';

export default function AddLabAssistant() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });
  
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    lab_type: '',
    license: '',
    lab_timings: {
      monday: { start: '09:00', end: '17:00', available: true },
      tuesday: { start: '09:00', end: '17:00', available: true },
      wednesday: { start: '09:00', end: '17:00', available: true },
      thursday: { start: '09:00', end: '17:00', available: true },
      friday: { start: '09:00', end: '17:00', available: true },
      saturday: { start: '09:00', end: '14:00', available: true },
      sunday: { start: '00:00', end: '00:00', available: false }
    },
    mobile_no: '',
    password: '',
    lab_person_login_id: ''
  });

  const [admin_id, setAdmin_id] = useState<string>('');

  useEffect(() => {
    const unparsed_admin_id = localStorage.getItem('adminInfo');
    if (unparsed_admin_id) {
      const admin = JSON.parse(unparsed_admin_id);
      const admin_id = admin.admin_id;

      setAdmin_id(admin_id);  
      console.log(admin_id, "im here");
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTimingChange = (day: string, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      lab_timings: {
        ...prev.lab_timings,
        [day]: {
          ...prev.lab_timings[day as keyof typeof prev.lab_timings],
          [field]: value
        }
      }
    }));
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
    setLoading(true);
    
    try {
      // Generate login_id before submission
      const lab_person_login_id = generateLoginId();

      // Prepare data for submission
      const processedData = {
        ...formData,
        lab_person_login_id,
        admin_id
      };
      
      const { data, error } = await supabase
        .from('lab_person')
        .insert([processedData]);
        
      if (error) {
        console.log(error);
        throw error;
      }
      
      setMessage({ 
        type: 'success', 
        content: `✅ Lab Assistant added successfully! Login ID: ${lab_person_login_id}` 
      });
      
      // Reset form after successful submission
      setFormData({
        name: '',
        gender: '',
        lab_type: '',
        license: '',
        lab_timings: {
          monday: { start: '09:00', end: '17:00', available: true },
          tuesday: { start: '09:00', end: '17:00', available: true },
          wednesday: { start: '09:00', end: '17:00', available: true },
          thursday: { start: '09:00', end: '17:00', available: true },
          friday: { start: '09:00', end: '17:00', available: true },
          saturday: { start: '09:00', end: '14:00', available: true },
          sunday: { start: '00:00', end: '00:00', available: false }
        },
        mobile_no: '',
        password: '',
        lab_person_login_id: ''
      });
      
    } catch (error: any) {
        console.log(error);
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
                🔬 Add New Lab Assistant
              </h1>
              <p className="text-gray-600 mb-6">
                Complete the form to add a new lab assistant to the database.
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
                        <p className="text-sm text-gray-600 mb-2">Lab Assistant's Login Credentials:</p>
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
                            <p>Please save or share this Login ID with the lab assistant. It will be required for accessing the system.</p>
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
                    placeholder="Enter lab assistant's full name"
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
                
                {/* Lab Type */}
                <div className="form-group">
                  <label className="block text-gray-700 mb-2" htmlFor="lab_type">
                    🧪 Lab Type
                  </label>
                  <select
                    id="lab_type"
                    name="lab_type"
                    value={formData.lab_type}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select lab type</option>
                    <option value="Pathology">Pathology</option>
                    <option value="Radiology">Radiology</option>
                    <option value="Microbiology">Microbiology</option>
                    <option value="Biochemistry">Biochemistry</option>
                    <option value="Hematology">Hematology</option>
                    <option value="Immunology">Immunology</option>
                    <option value="General">General</option>
                  </select>
                </div>
                
                {/* License */}
                <div className="form-group">
                  <label className="block text-gray-700 mb-2" htmlFor="license">
                    📜 License Number
                  </label>
                  <input
                    type="text"
                    id="license"
                    name="license"
                    value={formData.license}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter lab assistant license number"
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
                
                {/* Lab Timings */}
                <div className="form-group md:col-span-2">
                  <label className="block text-gray-700 mb-2">
                    🕒 Lab Timings
                  </label>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                        <div key={day} className="border rounded-lg p-3 bg-white">
                          <div className="flex items-center justify-between mb-2">
                            <span className="capitalize font-medium">{day}</span>
                            <label className="inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.lab_timings[day as keyof typeof formData.lab_timings].available}
                                onChange={(e) => handleTimingChange(day, 'available', e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                              <span className="ml-2 text-sm font-medium text-gray-700">Available</span>
                            </label>
                          </div>
                          
                          {formData.lab_timings[day as keyof typeof formData.lab_timings].available && (
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Start Time</label>
                                <input
                                  type="time"
                                  value={formData.lab_timings[day as keyof typeof formData.lab_timings].start}
                                  onChange={(e) => handleTimingChange(day, 'start', e.target.value)}
                                  className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">End Time</label>
                                <input
                                  type="time"
                                  value={formData.lab_timings[day as keyof typeof formData.lab_timings].end}
                                  onChange={(e) => handleTimingChange(day, 'end', e.target.value)}
                                  className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      name: '',
                      gender: '',
                      lab_type: '',
                      license: '',
                      lab_timings: {
                        monday: { start: '09:00', end: '17:00', available: true },
                        tuesday: { start: '09:00', end: '17:00', available: true },
                        wednesday: { start: '09:00', end: '17:00', available: true },
                        thursday: { start: '09:00', end: '17:00', available: true },
                        friday: { start: '09:00', end: '17:00', available: true },
                        saturday: { start: '09:00', end: '14:00', available: true },
                        sunday: { start: '00:00', end: '00:00', available: false }
                      },
                      mobile_no: '',
                      password: '',
                      lab_person_login_id: ''
                    });
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
                  {loading ? '⏳ Processing...' : '✅ Add Lab Assistant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}