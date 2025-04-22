export function compareTimes(time1: string, time2: string): number {
    // Convert 12-hour format (e.g., 03:00PM) to minutes since midnight
    function toMinutes(time: string): number {
      const regex = /^(\d{1,2}):(\d{2})(AM|PM)$/i;
      const match = time.match(regex);
  
      if (!match) throw new Error("Invalid time format");
  
      let [_, hoursStr, minutesStr, meridian] = match;
      let hours = parseInt(hoursStr, 10);
      const minutes = parseInt(minutesStr, 10);
  
      if (meridian.toUpperCase() === 'PM' && hours !== 12) {
        hours += 12;
      }
      if (meridian.toUpperCase() === 'AM' && hours === 12) {
        hours = 0;
      }
  
      return hours * 60 + minutes;
    }
  
    const minutes1 = toMinutes(time1);
    const minutes2 = toMinutes(time2);
  
    if (minutes1 < minutes2) return -1; // time1 is earlier
    if (minutes1 > minutes2) return 1;  // time2 is earlier
    return 0;                           // both are equal
  }
  