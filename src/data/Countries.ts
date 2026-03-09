export interface Country {
  code: string;
  name: string;
  phoneMask?: string;
  zipMask?: string;
  zipLabel: string;
  stateLabel: string;
  stateRequired: boolean;
}

const pinnedCountries: Country[] = [
  { code: 'US', name: 'United States', phoneMask: '(999) 999-9999', zipMask: '99999', zipLabel: 'ZIP Code', stateLabel: 'State', stateRequired: true },
  { code: 'CA', name: 'Canada', phoneMask: '(999) 999-9999', zipMask: 'A9A 9A9', zipLabel: 'Postal Code', stateLabel: 'Province', stateRequired: true },
  { code: 'AU', name: 'Australia', phoneMask: '9999 999 999', zipMask: '9999', zipLabel: 'Post Code', stateLabel: 'State', stateRequired: true },
];

const otherCountries: Country[] = [
  { code: 'AF', name: 'Afghanistan', zipLabel: 'ZIP Code', stateLabel: 'State', stateRequired: false },
  { code: 'AL', name: 'Albania', zipLabel: 'ZIP Code', stateLabel: 'State', stateRequired: false },
  { code: 'DZ', name: 'Algeria', zipLabel: 'ZIP Code', stateLabel: 'State', stateRequired: false },
  { code: 'AR', name: 'Argentina', zipLabel: 'ZIP Code', stateLabel: 'State', stateRequired: false },
  { code: 'AT', name: 'Austria', zipLabel: 'ZIP Code', stateLabel: 'State', stateRequired: false },
  { code: 'BE', name: 'Belgium', zipLabel: 'ZIP Code', stateLabel: 'State', stateRequired: false },
  { code: 'BR', name: 'Brazil', zipLabel: 'ZIP Code', stateLabel: 'State', stateRequired: false },
  { code: 'CL', name: 'Chile', zipLabel: 'ZIP Code', stateLabel: 'State', stateRequired: false },
  { code: 'CN', name: 'China', zipLabel: 'ZIP Code', stateLabel: 'State', stateRequired: false },
  { code: 'CO', name: 'Colombia', zipLabel: 'ZIP Code', stateLabel: 'State', stateRequired: false },
  { code: 'CZ', name: 'Czech Republic', zipLabel: 'ZIP Code', stateLabel: 'State', stateRequired: false },
  { code: 'DK', name: 'Denmark', zipLabel: 'ZIP Code', stateLabel: 'State', stateRequired: false },
  { code: 'EG', name: 'Egypt', zipLabel: 'ZIP Code', stateLabel: 'State', stateRequired: false },
  { code: 'FI', name: 'Finland', zipLabel: 'ZIP Code', stateLabel: 'State', stateRequired: false },
  { code: 'FR', name: 'France', zipLabel: 'ZIP Code', stateLabel: 'State', stateRequired: false },
  { code: 'DE', name: 'Germany', zipLabel: 'ZIP Code', stateLabel: 'State', stateRequired: false },
  { code: 'GR', name: 'Greece', zipLabel: 'ZIP Code', stateLabel: 'State', stateRequired: false },
  { code: 'HK', name: 'Hong Kong', zipLabel: 'ZIP Code', stateLabel: 'State', stateRequired: false },
  { code: 'IN', name: 'India', zipLabel: 'ZIP Code', stateLabel: 'State', stateRequired: false },
  { code: 'ID', name: 'Indonesia', zipLabel: 'ZIP Code', stateLabel: 'State', stateRequired: false },
  { code: 'IE', name: 'Ireland', zipLabel: 'ZIP Code', stateLabel: 'State', stateRequired: false },
  { code: 'IL', name: 'Israel', zipLabel: 'ZIP Code', stateLabel: 'State', stateRequired: false },
  { code: 'IT', name: 'Italy', zipLabel: 'ZIP Code', stateLabel: 'State', stateRequired: false },
  { code: 'JP', name: 'Japan', zipLabel: 'ZIP Code', stateLabel: 'State', stateRequired: false },
  { code: 'KR', name: 'South Korea', zipLabel: 'ZIP Code', stateLabel: 'State', stateRequired: false },
  { code: 'MY', name: 'Malaysia', zipLabel: 'ZIP Code', stateLabel: 'State', stateRequired: false },
  { code: 'MX', name: 'Mexico', zipLabel: 'ZIP Code', stateLabel: 'State', stateRequired: false },
  { code: 'NL', name: 'Netherlands', zipLabel: 'ZIP Code', stateLabel: 'State', stateRequired: false },
  { code: 'NZ', name: 'New Zealand', zipLabel: 'ZIP Code', stateLabel: 'State', stateRequired: false },
  { code: 'NO', name: 'Norway', zipLabel: 'ZIP Code', stateLabel: 'State', stateRequired: false },
  { code: 'PK', name: 'Pakistan', zipLabel: 'ZIP Code', stateLabel: 'State', stateRequired: false },
  { code: 'PE', name: 'Peru', zipLabel: 'ZIP Code', stateLabel: 'State', stateRequired: false },
  { code: 'PH', name: 'Philippines', zipLabel: 'ZIP Code', stateLabel: 'State', stateRequired: false },
  { code: 'PL', name: 'Poland', zipLabel: 'ZIP Code', stateLabel: 'State', stateRequired: false },
  { code: 'PT', name: 'Portugal', zipLabel: 'ZIP Code', stateLabel: 'State', stateRequired: false },
  { code: 'RO', name: 'Romania', zipLabel: 'ZIP Code', stateLabel: 'State', stateRequired: false },
  { code: 'RU', name: 'Russia', zipLabel: 'ZIP Code', stateLabel: 'State', stateRequired: false },
  { code: 'SA', name: 'Saudi Arabia', zipLabel: 'ZIP Code', stateLabel: 'State', stateRequired: false },
  { code: 'SG', name: 'Singapore', zipLabel: 'ZIP Code', stateLabel: 'State', stateRequired: false },
  { code: 'ZA', name: 'South Africa', zipLabel: 'ZIP Code', stateLabel: 'State', stateRequired: false },
  { code: 'ES', name: 'Spain', zipLabel: 'ZIP Code', stateLabel: 'State', stateRequired: false },
  { code: 'SE', name: 'Sweden', zipLabel: 'ZIP Code', stateLabel: 'State', stateRequired: false },
  { code: 'CH', name: 'Switzerland', zipLabel: 'ZIP Code', stateLabel: 'State', stateRequired: false },
  { code: 'TW', name: 'Taiwan', zipLabel: 'ZIP Code', stateLabel: 'State', stateRequired: false },
  { code: 'TH', name: 'Thailand', zipLabel: 'ZIP Code', stateLabel: 'State', stateRequired: false },
  { code: 'TR', name: 'Turkey', zipLabel: 'ZIP Code', stateLabel: 'State', stateRequired: false },
  { code: 'AE', name: 'United Arab Emirates', zipLabel: 'ZIP Code', stateLabel: 'State', stateRequired: false },
  { code: 'GB', name: 'United Kingdom', zipLabel: 'ZIP Code', stateLabel: 'State', stateRequired: false },
  { code: 'VN', name: 'Vietnam', zipLabel: 'ZIP Code', stateLabel: 'State', stateRequired: false },
].sort((a, b) => a.name.localeCompare(b.name));

export const countries: Country[] = [...pinnedCountries, ...otherCountries];

export const pinnedCountryCodes = pinnedCountries.map(c => c.code);

export const getCountryByCode = (code: string): Country | undefined =>
  countries.find(c => c.code === code);

// Simulated API call
export const fetchCountries = (): Promise<Country[]> =>
  new Promise(resolve => setTimeout(() => resolve(countries), 100));
