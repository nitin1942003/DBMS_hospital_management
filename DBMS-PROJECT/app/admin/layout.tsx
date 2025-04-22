"use client"
import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LogoutButton from '@/components/Logoutbutton'

interface AdminInfo {
  admin_type: string; 
  name: string;
  email_id: string;
  address: string;
  gender: string;
  created_at: string;
  admin_id?: string;
  pharmacist_id?: string;
  lab_person_id?: string;
}     

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDoctorDropdownOpen, setIsDoctorDropdownOpen] = useState(false)
  const [isPharmacistDropdownOpen, setIsPharmacistDropdownOpen] = useState(false)
  const [isLabAssistantDropdownOpen, setIsLabAssistantDropdownOpen] = useState(false)
  
  const doctorDropdownRef = useRef<HTMLDivElement>(null)
  const pharmacistDropdownRef = useRef<HTMLDivElement>(null)
  const labAssistantDropdownRef = useRef<HTMLDivElement>(null)
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null)

  const isActive = (path: string) => {
    return pathname === path ? 'bg-blue-700 text-white' : 'text-gray-300 hover:bg-blue-700 hover:text-white'
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const toggleDoctorDropdown = () => {
    setIsDoctorDropdownOpen(!isDoctorDropdownOpen)
    // Close other dropdowns when opening this one
    if (!isDoctorDropdownOpen) {
      setIsPharmacistDropdownOpen(false)
      setIsLabAssistantDropdownOpen(false)
    }
  }

  const togglePharmacistDropdown = () => {
    setIsPharmacistDropdownOpen(!isPharmacistDropdownOpen)
    // Close other dropdowns when opening this one
    if (!isPharmacistDropdownOpen) {
      setIsDoctorDropdownOpen(false)
      setIsLabAssistantDropdownOpen(false)
    }
  }

  const toggleLabAssistantDropdown = () => {
    setIsLabAssistantDropdownOpen(!isLabAssistantDropdownOpen)
    // Close other dropdowns when opening this one
    if (!isLabAssistantDropdownOpen) {
      setIsDoctorDropdownOpen(false)
      setIsPharmacistDropdownOpen(false)
    }
  }

  useEffect(() => {
    const adminInfo = localStorage.getItem("adminInfo")
    if(adminInfo){
      const parsedAdminInfo = JSON.parse(adminInfo || '{}');

      console.log(parsedAdminInfo, "parsedAdminInfo");
      
      // Determine admin_type based on the presence of specific IDs
      let adminType = '';
      if (parsedAdminInfo.pharmacist_id) {
        adminType = 'pharmacist';
      } else if (parsedAdminInfo.admin_id) {
        adminType = 'administrator';
      } else if (parsedAdminInfo.lab_person_id) {
        adminType = 'lab_person';
      }
      
      // Set the admin_type in the state
      setAdminInfo({
        ...parsedAdminInfo,
        admin_type: adminType
      });
      
      console.log({...parsedAdminInfo, admin_type: adminType}, "parsedAdminInfo")
    }
  }, [])

  // Handle clicks outside of dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is outside doctor dropdown
      if (isDoctorDropdownOpen && 
          doctorDropdownRef.current && 
          !doctorDropdownRef.current.contains(event.target as Node)) {
        setIsDoctorDropdownOpen(false)
      }
      
      // Check if click is outside pharmacist dropdown
      if (isPharmacistDropdownOpen && 
          pharmacistDropdownRef.current && 
          !pharmacistDropdownRef.current.contains(event.target as Node)) {
        setIsPharmacistDropdownOpen(false)
      }
      
      // Check if click is outside lab assistant dropdown
      if (isLabAssistantDropdownOpen && 
          labAssistantDropdownRef.current && 
          !labAssistantDropdownRef.current.contains(event.target as Node)) {
        setIsLabAssistantDropdownOpen(false)
      }
    }

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside)
    
    // Clean up
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDoctorDropdownOpen, isPharmacistDropdownOpen, isLabAssistantDropdownOpen])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-blue-800 shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">🏥</span>
              </div>
              <div className="ml-3">
                <span className="text-white font-semibold text-xl">{adminInfo?.admin_type === 'administrator' ? 'Admin' : adminInfo?.admin_type === 'pharmacist' ? 'Pharmacist' : 'Lab Assistant'} Dashboard </span>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  href="/"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive('/admin/dashboard')}`}
                >
                  Home
                </Link>
                
                {/* Doctor Dropdown - Only show for administrators */}
                {adminInfo?.admin_type === 'administrator' && (
                  <div className="relative" ref={doctorDropdownRef}>
                    <button
                      onClick={toggleDoctorDropdown}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center ${
                        isActive('/admin/adddoctor') || isActive('/admin/removedoctor') 
                          ? 'bg-blue-700 text-white' 
                          : 'text-gray-300 hover:bg-blue-700 hover:text-white'
                      }`}
                    >
                      Doctor
                      <svg 
                        className={`ml-1 h-4 w-4 transition-transform ${isDoctorDropdownOpen ? 'transform rotate-180' : ''}`} 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {/* Dropdown Menu */}
                    {isDoctorDropdownOpen && (
                      <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                        <div className="py-1">
                          <Link
                            href="/admin/adddoctor"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-100"
                          >
                            Add Doctor
                          </Link>
                          <Link
                            href="/admin/removedoctor"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-100"
                          >
                            Remove Doctor
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Pharmacist Dropdown - Only show for administrators */}
                {adminInfo?.admin_type === 'administrator' && (
                  <div className="relative" ref={pharmacistDropdownRef}>
                    <button
                      onClick={togglePharmacistDropdown}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center ${
                        isActive('/admin/addpharmasist') || isActive('/admin/removepharmasist') 
                          ? 'bg-blue-700 text-white' 
                          : 'text-gray-300 hover:bg-blue-700 hover:text-white'
                      }`}
                    >
                      Pharmacist
                      <svg 
                        className={`ml-1 h-4 w-4 transition-transform ${isPharmacistDropdownOpen ? 'transform rotate-180' : ''}`} 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {/* Dropdown Menu */}
                    {isPharmacistDropdownOpen && (
                      <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                        <div className="py-1">
                          <Link
                            href="/admin/addpharmasist"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-100"
                          >
                            Add Pharmacist
                          </Link>
                          <Link
                            href="/admin/removepharmasist"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-100"
                          >
                            Remove Pharmacist
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Lab Assistant Dropdown - Only show for administrators */}
                {adminInfo?.admin_type === 'administrator' && (
                  <div className="relative" ref={labAssistantDropdownRef}>
                    <button
                      onClick={toggleLabAssistantDropdown}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center ${
                        isActive('/admin/addlabassistants') || isActive('/admin/removelabassistant') 
                          ? 'bg-blue-700 text-white' 
                          : 'text-gray-300 hover:bg-blue-700 hover:text-white'
                      }`}
                    >
                      Lab Assistant
                      <svg 
                        className={`ml-1 h-4 w-4 transition-transform ${isLabAssistantDropdownOpen ? 'transform rotate-180' : ''}`} 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {/* Dropdown Menu */}
                    {isLabAssistantDropdownOpen && (
                      <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                        <div className="py-1">
                          <Link
                            href="/admin/addlabassistants"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-100"
                          >
                            Add Lab Assistant
                          </Link>
                          <Link
                            href="/admin/removelabassistant"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-100"
                          >
                            Remove Lab Assistant
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Give Medicines Link - Only show for pharmacists */}
                {adminInfo?.admin_type === 'pharmacist' && (
                  <Link
                    href="/admin/givemedicine"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive('/admin/givemedicines')}`}
                  >
                    Give Medicines
                  </Link>
                )}
                
                <Link
                  href="/admin/admininfo"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive('/admin/admininfo')}`}
                >
                  Profile
                </Link>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                <span className="sr-only">Open main menu</span>
                {!isMobileMenuOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            </div>

            {/* Logout Button */}
            <div className="hidden md:flex items-center">
              <LogoutButton removeitem="adminInfo" />
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div 
          className={`md:hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          } overflow-hidden`}
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-blue-800">
            <Link
              href="/"
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${isActive('/')}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            
            {/* Doctor Section in Mobile Menu - Only show for administrators */}
            {adminInfo?.admin_type === 'administrator' && (
              <div>
                <button
                  onClick={toggleDoctorDropdown}
                  className="w-full flex justify-between items-center px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-blue-700 hover:text-white"
                >
                  Doctor
                  <svg 
                    className={`ml-1 h-5 w-5 transition-transform ${isDoctorDropdownOpen ? 'transform rotate-180' : ''}`} 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isDoctorDropdownOpen && (
                  <div className="pl-4 space-y-1 mt-1">
                    <Link
                      href="/admin/adddoctor"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-blue-600 hover:text-white"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Add Doctor
                    </Link>
                    <Link
                      href="/admin/removedoctor"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-blue-600 hover:text-white"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Remove Doctor
                    </Link>
                  </div>
                )}
              </div>
            )}
            
            {/* Pharmacist Section in Mobile Menu - Only show for administrators */}
            {adminInfo?.admin_type === 'administrator' && (
              <div>
                <button
                  onClick={togglePharmacistDropdown}
                  className="w-full flex justify-between items-center px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-blue-700 hover:text-white"
                >
                  Pharmacist
                  <svg 
                    className={`ml-1 h-5 w-5 transition-transform ${isPharmacistDropdownOpen ? 'transform rotate-180' : ''}`} 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isPharmacistDropdownOpen && (
                  <div className="pl-4 space-y-1 mt-1">
                    <Link
                      href="/admin/addpharmasist"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-blue-600 hover:text-white"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Add Pharmacist
                    </Link>
                    <Link
                      href="/admin/removepharmasist"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-blue-600 hover:text-white"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Remove Pharmacist
                    </Link>
                  </div>
                )}
              </div>
            )}
            
            {/* Lab Assistant Section in Mobile Menu - Only show for administrators */}
            {adminInfo?.admin_type === 'administrator' && (
              <div>
                <button
                  onClick={toggleLabAssistantDropdown}
                  className="w-full flex justify-between items-center px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-blue-700 hover:text-white"
                >
                  Lab Assistant
                  <svg 
                    className={`ml-1 h-5 w-5 transition-transform ${isLabAssistantDropdownOpen ? 'transform rotate-180' : ''}`} 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isLabAssistantDropdownOpen && (
                  <div className="pl-4 space-y-1 mt-1">
                    <Link
                      href="/admin/addlabassistants"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-blue-600 hover:text-white"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Add Lab Assistant
                    </Link>
                    <Link
                      href="/admin/removelabassistant"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-blue-600 hover:text-white"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Remove Lab Assistant
                    </Link>
                  </div>
                )}
              </div>
            )}
            
            {/* Give Medicines Link in Mobile Menu - Only show for pharmacists */}
            {adminInfo?.admin_type === 'pharmacist' && (
              <Link
                href="/admin/givemedicines"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${isActive('/admin/givemedicines')}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Give Medicines
              </Link>
            )}
            
            <Link
              href="/admin/admininfo"
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${isActive('/admin/admininfo')}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Profile
            </Link>
            <div className="px-3 py-2">
              <LogoutButton removeitem="adminInfo" />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content with padding for fixed navbar */}
      <main className="pt-20 pb-6">
        {children}
      </main>
    </div>
  )
}

export default AdminLayout