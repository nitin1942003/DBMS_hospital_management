// pages/students.js
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/providers/db'

export default function Students() {
  const [students, setStudents] = useState<any[]>([])

  // Fetch student data from Supabase
  useEffect(() => {
    async function fetchStudents() {
      const { data, error } = await supabase.from('students').select('*');
      console.log(data);
      if (error) {
        console.error('Error fetching data:', error)
      } else {
        setStudents(data)
      }
    }
    fetchStudents()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6">Student List</h2>
        {students.length === 0 ? (
          <p className="text-gray-600">No students found.</p>
        ) : (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 p-2">ID</th>
                <th className="border border-gray-300 p-2">Name</th>
                <th className="border border-gray-300 p-2">Email</th>
                <th className="border border-gray-300 p-2">Course</th>
                <th className="border border-gray-300 p-2">Created At</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} className="text-center">
                  <td className="border border-gray-300 p-2">{student.id}</td>
                  <td className="border border-gray-300 p-2">{student.name}</td>
                  <td className="border border-gray-300 p-2">{student.email}</td>
                  <td className="border border-gray-300 p-2">{student.course}</td>
                  <td className="border border-gray-300 p-2">
                    {new Date(student.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
