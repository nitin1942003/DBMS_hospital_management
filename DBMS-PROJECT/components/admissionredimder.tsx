"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/providers/db';

interface BedInfo {
  bed_no: string;
  allot_date_time: string;
  location_id: string;
  location?: {
    description: string;
    floor: string;
  };
} 

const AdmissionReminder: React.FC = () => {
  const [patientInfo, setPatientInfo] = useState<{ p_id: string } | null>(null);
  const [bedInfo, setBedInfo] = useState<BedInfo[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get patient info from localStorage
    const storedPatientInfo = localStorage.getItem("patientInfo");
    if (storedPatientInfo) {
      const parsedPatientInfo = JSON.parse(storedPatientInfo);
      setPatientInfo(parsedPatientInfo);
    }
  }, []);

  useEffect(() => {
    const fetchBedInfo = async () => {
      try {
        setLoading(true);
        if (!patientInfo?.p_id) return;
        
        const { data, error } = await supabase
          .from('beds')
          .select(`
            bed_no, 
            allot_date_time, 
            location_id,
            location:location_id (
              description,
              floor
            )
          `)
          .eq('patient_id', patientInfo.p_id);

        console.log(data, "data");

        if (error) {
          throw error;
        }

        if (data) {
          setBedInfo(data as unknown as BedInfo[]);
        }
      } catch (err: any) {
        console.error('Error fetching bed information:', err);
        setError(err.message || 'Failed to fetch bed information');
      } finally {
        setLoading(false);
      }
    };

    if (patientInfo?.p_id) {
      fetchBedInfo();
    }
  }, [patientInfo]);

  if (loading) {
    return <div className="p-4 bg-gray-100 rounded-md animate-pulse">Loading bed information...</div>;
  }

  if (error) {
    return <div className="p-4 bg-red-100 text-red-700 rounded-md">Error: {error}</div>;
  }

  if (!bedInfo || bedInfo.length === 0) {
    return null;
  }

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-md shadow-sm">
      <h3 className="text-lg font-medium text-blue-800 mb-2">Admission Information</h3>
      <div className="space-y-2">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">Bed Number:</span> {bedInfo[0].bed_no}
        </p>
        <p className="text-sm text-gray-700">
          <span className="font-semibold">Ward:</span> {bedInfo[0].location?.description || 'Unknown'}
        </p>
        <p className="text-sm text-gray-700">
          <span className="font-semibold">Floor:</span> {bedInfo[0].location?.floor || 'Unknown'}
        </p>
        <p className="text-sm text-gray-700">
          <span className="font-semibold">Allotted on:</span>{' '}
          {new Date(bedInfo[0].allot_date_time).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default AdmissionReminder;