export function daysBetweenDates(dateStr1: string, dateStr2: string): number {
    const parseDate = (str: string): Date => {
      const [yyyy, mm, dd] = str.split("-").map(Number);
      return new Date(yyyy, mm - 1, dd); // month is 0-based
    };
  
    const d1 = parseDate(dateStr1);
    const d2 = parseDate(dateStr2);
  
    // Normalize to midnight to avoid partial days
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);
  
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  