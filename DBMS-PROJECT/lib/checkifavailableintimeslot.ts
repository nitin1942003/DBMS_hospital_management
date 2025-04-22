import { supabase } from "@/providers/db";

export const checkIfAvailableInTimeSlot = async (doctorId: string, date: string, time: string) => {
    const { data, error } = await supabase.from('appointment').select('*').eq('d_id', doctorId).eq('date', date).eq('time', time);

    return data?.length;
}