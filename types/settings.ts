export interface RateSettings {
  id?:                    string;
  user_id?:               string;
  amg_surcharge:          number;
  suv_surcharge:          number;
  pickup_surcharge:       number;
  base_towing_fee:        number;
  time_cutting_rate:      number;
  container_load_price:   number;
  container_lot_payment:  number;
  container_land_fee:     number;
}

export interface CompanySettings {
  id?:              string;
  user_id?:         string;
  company_name:     string;
  company_phone:    string;
  company_email:    string;
  company_address:  string;
  logo_path?:       string;
  vat_number?:      string;
}

export const DEFAULT_RATES: RateSettings = {
  amg_surcharge:         2500,
  suv_surcharge:         1800,
  pickup_surcharge:      1500,
  base_towing_fee:       800,
  time_cutting_rate:     300,
  container_load_price:  0,
  container_lot_payment: 0,
  container_land_fee:    0,
};

export const DEFAULT_COMPANY: CompanySettings = {
  company_name:    "MoniekensAutoLLC",
  company_phone:   '',
  company_email:   '',
  company_address: '',
};
