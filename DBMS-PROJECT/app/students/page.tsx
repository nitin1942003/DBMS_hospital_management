'use client'

import { useState } from 'react'
import { supabase } from '@/providers/db'

export default function Home() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [course, setCourse] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const { data, error } = await supabase.from('students').insert([
      { name, email, course },
    ])

    if (error) {
      alert('Error inserting data: ' + error.message)
    } else {
      alert('Student added successfully!')
      setName('')
      setEmail('')
      setCourse('')
    }
    setLoading(false)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-6">Add Student</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            placeholder="Course"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Student'}
          </button>
        </form>
      </div>
    </div>
  )
}
