'use client'
import React, { useEffect, useState      } from 'react'
import { supabase } from '@/providers/db'

const page = () => {

    const [adminInfo, setAdminInfo] = useState<any>(null)
    const [patientInfo, setPatientInfo] = useState<any>(null)
    const [doctorInfo, setDoctorInfo] = useState<any>(null)

    useEffect(() => {
        const fetchData = async () => {
            const adminInfo = localStorage.getItem("adminInfo")
            
            const patientInfo = localStorage.getItem("patientInfo")

            const doctorInfo = localStorage.getItem("doctorInfo")

            if(adminInfo){
                const parsedAdminInfo = JSON.parse(adminInfo || '{}');
                setAdminInfo(parsedAdminInfo)
                console.log(parsedAdminInfo, "parsedAdminInfo")
            }
            if(patientInfo){
                const parsedPatientInfo = JSON.parse(patientInfo || '{}');
                setPatientInfo(parsedPatientInfo)
                console.log(parsedPatientInfo, "parsedPatientInfo")
            }
            if(doctorInfo){
                const parsedDoctorInfo = JSON.parse(doctorInfo || '{}');
                setDoctorInfo(parsedDoctorInfo)
                console.log(parsedDoctorInfo, "parsedDoctorInfo")
                
                if (parsedDoctorInfo && parsedDoctorInfo.d_id) {
                    const { data, error } = await supabase
                        .from('prescription')
                        .select('p_id,patients(name,gender), appointment_id, diagnosis, created_at')
                        .eq('d_id', parsedDoctorInfo.d_id)

                        console.log(data, "data")
                }
            }
        }

        fetchData();
    }, [])
  return (
    <div>
            <h1>Sample Page</h1>
            
    </div>
  )
}

export default page