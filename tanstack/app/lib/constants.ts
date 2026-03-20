export const DIVISIONS = [
  { code: 'G', name: 'General Line' },
  { code: 'C', name: 'Compact' },
  { code: 'P', name: 'Paving' },
  { code: 'R', name: 'Heavy Rents' },
  { code: 'S', name: 'Power Systems' },
  { code: 'V', name: 'Rental Services' },
  { code: 'X', name: 'Power Rental' },
] as const;

export const getDivisionName = (code: string): string => {
  const division = DIVISIONS.find(d => d.code === code);
  return division ? division.name : code;
};
