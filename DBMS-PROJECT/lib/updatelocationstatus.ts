import { supabase } from "@/providers/db";

export const updateLocationStatus = async (location_id: string,) => {
console.log(location_id, "im here location id");
const { data, error } = await supabase
    .from('location')
    .update({ alloted: 'YES' })
    .match({ location_id: location_id });

    console.log(data, "im here data");

  if (error) {
    console.error('Error updating location status:', error);
    throw error;
  }
  return data;
};
