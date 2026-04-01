/*
  # Customer Port/Service (SVC) Database Schema

  1. New Tables
    - `svcs` - Main service records table
      - `id` (uuid, primary key)
      - `svc_name` (text) - Service identifier (e.g., "104017-SV1-IA-01")
      - `service_id` (text) - Unique service ID
      - `customer_name` (text) - Customer company name
      - `customer_number` (text) - Customer account number
      - `product_type` (text) - Product type (e.g., "IA" for Internet Access)
      - `encapsulation` (text) - Encapsulation method
      - `metro` (text) - Metro location
      - `ibx` (text) - IBX data center identifier
      - `region` (text) - Geographic region
      - `capacity` (text) - Service capacity (e.g., "10G", "100G")
      - `asn` (integer) - Autonomous System Number
      - `ipv4_address` (text) - IPv4 address assignment
      - `ipv6_address` (text) - IPv6 address assignment
      - `vlan` (text) - VLAN ID
      - `ccid` (text) - Circuit ID
      - `mac_address` (text) - MAC address
      - `asset_number` (text) - Asset tracking number
      - `usage_status` (text) - Usage status (e.g., "Installed", "Provisioned")
      - `ecee_status` (text) - ECEE status (e.g., "PROVISIONED", "PENDING")
      - `has_lag` (boolean) - Link Aggregation Group flag
      - `lag_group_id` (text) - LAG group identifier
      - `tag_protocol` (text) - Tagging protocol
      - `connection_id` (text) - Associated connection UUID
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `svcs` table
    - Add policy for authenticated users to read all SVC data
    - Add policy for authenticated users to manage SVC data
*/

CREATE TABLE IF NOT EXISTS svcs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  svc_name text NOT NULL,
  service_id text,
  customer_name text NOT NULL,
  customer_number text,
  product_type text NOT NULL,
  encapsulation text,
  metro text,
  ibx text,
  region text,
  capacity text,
  asn integer,
  ipv4_address text,
  ipv6_address text,
  vlan text,
  ccid text,
  mac_address text,
  asset_number text,
  usage_status text DEFAULT 'Pending',
  ecee_status text DEFAULT 'PENDING',
  has_lag boolean DEFAULT false,
  lag_group_id text,
  tag_protocol text,
  connection_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE svcs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all SVCs"
  ON svcs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert SVCs"
  ON svcs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update SVCs"
  ON svcs
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete SVCs"
  ON svcs
  FOR DELETE
  TO authenticated
  USING (true);

-- Insert sample data for demonstration
INSERT INTO svcs (svc_name, customer_name, customer_number, product_type, encapsulation, metro, ibx, region, capacity, asn, ipv4_address, vlan, ccid, asset_number, usage_status, ecee_status, has_lag, tag_protocol)
VALUES
  ('104017-SV1-IA-01', 'EQIX AB337', '578210', 'IA', '', 'SV1', 'SV1', 'Americas', '10G', 123, '1.1.1.5', '', '2100587', '4-208012881467', 'Installed', 'PROVISIONED', false, ''),
  ('118533-SV1-IA-test1', 'AT&T Corp.', '118533', 'IA', '', 'SV1', 'SV1', 'Americas', '100G', 7018, '', '', '2100642', '', 'Pending', 'PENDING', false, ''),
  ('578210-IA-SV1-TestEMA', 'EQIX AB337', '578210', 'IA', '', 'SV1', 'SV1', 'Americas', '10G', 123, '', '', '2100735', '', 'Installed', 'PROVISIONED', false, ''),
  ('578210-Test-IA1', 'EQIX AB337', '578210', 'IA', '', 'SV1', 'SV1', 'Americas', '10G', NULL, '', '', '2100891', '', 'Installed', 'PENDING', false, ''),
  ('SV1-aqw-1-v1-null-0-0-43', 'Level 3 Communications', '789456', 'IA-Equinix Internet Access', '', 'SV1', 'SV1', 'Americas', '10G', 3356, '192.168.1.1', '100', '2100954', 'AST-789456-001', 'Installed', 'PROVISIONED', true, 'dot1q')
ON CONFLICT DO NOTHING;
