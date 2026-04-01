// Settings types — TypeScript interfaces for company info and rate configuration
export interface CompanySettings {
  name: string;
  logoUrl: string | null;
  address: string;
  phone: string;
  email: string;
}

export interface RateSettings {
  exportBaseRate: number;
  containerBaseRate: number;
  towingPerMileRate: number;
  currency: string;
}

export interface AppSettings {
  company: CompanySettings;
  rates: RateSettings;
}
