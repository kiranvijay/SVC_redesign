import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface SVC {
  id: string;
  svc_name: string;
  service_id: string | null;
  customer_name: string;
  customer_number: string | null;
  product_type: string;
  encapsulation: string | null;
  metro: string | null;
  ibx: string | null;
  region: string | null;
  capacity: string | null;
  asn: number | null;
  ipv4_address: string | null;
  ipv6_address: string | null;
  vlan: string | null;
  ccid: string | null;
  mac_address: string | null;
  asset_number: string | null;
  usage_status: string;
  ecee_status: string | null;
  has_lag: boolean;
  lag_group_id: string | null;
  tag_protocol: string | null;
  connection_id: string | null;
  port_name: string | null;
  switch_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface VirtualConnection {
  id: string;
  connection_name: string;
  access_point_type: string;
  bandwidth: number;
  location: string | null;
  side: string | null;
  connection_type: string | null;
  access_point_name: string | null;
}
