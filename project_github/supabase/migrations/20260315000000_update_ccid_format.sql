-- Update CCID format to 7-digit numbers
-- This migration updates any CCIDs that don't match the new format

UPDATE svcs
SET ccid = CASE
  WHEN svc_name = 'SV1-SV-PROD-010' THEN '2100123'
  WHEN ccid = 'CC-SV1-010' THEN '2100123'
  WHEN ccid IS NULL OR ccid = '' THEN NULL
  ELSE ccid
END
WHERE ccid IS NOT NULL AND (ccid LIKE 'CC-%' OR ccid !~ '^\d{7}$');
