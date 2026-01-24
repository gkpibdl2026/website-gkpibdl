-- Migration: Payment Settings Table
-- Menyimpan QRIS dan Rekening Bank Gereja
CREATE TABLE IF NOT EXISTS payment_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    qris_image_url TEXT,
    bank_accounts JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Insert default row (singleton pattern - hanya 1 row)
INSERT INTO payment_settings (id, qris_image_url, bank_accounts)
VALUES (
        '00000000-0000-0000-0000-000000000001',
        NULL,
        '[
    {"bank_name": "Bank BCA", "account_number": "1234567890", "account_holder": "GKPI Bandar Lampung", "color": "blue"},
    {"bank_name": "Bank Mandiri", "account_number": "0987654321", "account_holder": "GKPI Bandar Lampung", "color": "yellow"}
  ]'::jsonb
    ) ON CONFLICT (id) DO NOTHING;
-- RLS Policies
ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;
-- Everyone can read
CREATE POLICY "payment_settings_read_all" ON payment_settings FOR
SELECT USING (true);
-- Only authenticated users can update
CREATE POLICY "payment_settings_update_auth" ON payment_settings FOR
UPDATE USING (auth.role() = 'authenticated');
-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_payment_settings_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Trigger for updated_at
DROP TRIGGER IF EXISTS payment_settings_updated_at ON payment_settings;
CREATE TRIGGER payment_settings_updated_at BEFORE
UPDATE ON payment_settings FOR EACH ROW EXECUTE FUNCTION update_payment_settings_updated_at();