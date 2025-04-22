// pages/admin/add-pharmacist.tsx
"use client"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/providers/db';

export default function AddPharmacist() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });
  
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    license: '',
    mobile_no: '',
    password: '',
    pharmacist_login_id: ''
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
      const pharmacist_login_id = generateLoginId();

      // Prepare data for submission
      const processedData = {
        ...formData,
        pharmacist_login_id,
        admin_id
      };
      
      const { data, error } = await supabase
        .from('pharmacist')
        .insert([processedData]);
        
      if (error) {
        console.log(error);
        throw error;
      }
      
      setMessage({ 
        type: 'success', 
        content: `✅ Pharmacist added successfully! Login ID: ${pharmacist_login_id}` 
      });
      
      // Reset form after successful submission
      setFormData({
        name: '',
        gender: '',
        license: '',
        mobile_no: '',
        password: '',
        pharmacist_login_id: ''
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
                💊 Add New Pharmacist
              </h1>
              <p className="text-gray-600 mb-6">
                Complete the form to add a new pharmacist to the database.
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
                        <p className="text-sm text-gray-600 mb-2">Pharmacist's Login Credentials:</p>
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
                            <p>Please save or share this Login ID with the pharmacist. It will be required for accessing the system.</p>
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
                    placeholder="Enter pharmacist's full name"
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
                    placeholder="Enter pharmacist license number"
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
              </div>
              
              <div className="mt-8 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      name: '',
                      gender: '',
                      license: '',
                      mobile_no: '',
                      password: '',
                      pharmacist_login_id: ''
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
                  {loading ? '⏳ Processing...' : '✅ Add Pharmacist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}