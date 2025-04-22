import { supabase } from "@/providers/db";

export const checkpaid = async (appointment_id: string) => {
    const { data, error } = await supabase.from('bill').select('*').eq('appointment_id', appointment_id).single();
    console.log(data, "im here data");
    return 
}
