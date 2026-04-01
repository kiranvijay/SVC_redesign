/*
  # Add public read access to svcs table

  1. Changes
    - Add policy to allow anonymous/public users to read all SVCs
    - This enables the dashboard to display services without authentication
  
  2. Security
    - Only SELECT operations are allowed for anonymous users
    - INSERT, UPDATE, DELETE still require authentication
*/

-- Drop existing authenticated-only read policy
DROP POLICY IF EXISTS "Users can read all SVCs" ON svcs;

-- Create new policy allowing public read access
CREATE POLICY "Anyone can read all SVCs"
  ON svcs
  FOR SELECT
  TO anon, authenticated
  USING (true);