import { supabase } from "@/providers/db";
import { daysBetweenDates } from "./findnumberofdays";

const handlebedallotment = async (appointmentId: string, location: string) => {
    const todaydateandtime = new Date().toISOString();
    const beds_in_selected_ward = await supabase.from('beds').select('*').eq('location_id', location);
    console.log(beds_in_selected_ward, "beds_in_selected_ward");

    const available_beds = beds_in_selected_ward.data?.filter((bed) => bed.patient_id === null);
    console.log(available_beds, "available_beds");

    const selected_bed = available_beds?.[0];
    const selected_bed_id = selected_bed?.location_id;
    console.log(selected_bed_id, "selected_bed_id");
    const selected_bed_bed_no = selected_bed?.bed_no;
    console.log(selected_bed_bed_no, "selected_bed_bed_no");

    const appointment_data = await supabase.from('appointment').select('p_id').eq('appointment_id', appointmentId);
    console.log(appointment_data, "appointment_data");
    const patient_id = appointment_data.data?.[0].p_id;
    console.log(appointmentId, "appointmentId");

    console.log(patient_id, "patient_id");

    const { data, error } = await supabase.rpc('update_bed_allocation', {
        selected_location_id: selected_bed_id,
        selected_bed_no: selected_bed_bed_no,
        new_patient_id: patient_id,
        new_appointment_id: appointmentId,
        new_allot_date_time: todaydateandtime
    });
    


    console.log(data, "data of beds");

    if(error){
        console.log(error, "error");
        return {success: false, message: 'Bed allotment failed'};
    }

    if(data){


        const {data: prescription_data} = await supabase.from('prescription').select('*').eq('appointment_id', appointmentId).single();
        console.log(prescription_data, "prescription_data");

        


        /*const {data: data1, error: error1} = await supabase.from('bill').update({
            p_id: patient_id,
            appointment_id: appointmentId,
            bed_no: selected_bed_bed_no,
            location_id: selected_bed_id,
            allot_date_time: todaydateandtime
        }).eq('appointment_id', appointmentId);*/

       

        return {success: true, message: 'Bed allotted successfully'};
    }

    
}

export default handlebedallotment;
