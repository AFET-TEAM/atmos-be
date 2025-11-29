-- Add password field to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255) NOT NULL DEFAULT '';

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_users_password ON users(password);
