-- Enable RLS (Row Level Security)
-- This file contains the database schema for the CoHub Admin Panel
-- Run these commands in your Supabase SQL editor

-- Create residents table
CREATE TABLE IF NOT EXISTS residents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    apartment_number VARCHAR(10) NOT NULL,
    building VARCHAR(50) NOT NULL,
    move_in_date DATE NOT NULL,
    move_out_date DATE,
    emergency_contact_name VARCHAR(200) NOT NULL,
    emergency_contact_phone VARCHAR(20) NOT NULL,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending'))
);

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin'))
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS residents_email_idx ON residents(email);
CREATE INDEX IF NOT EXISTS residents_apartment_idx ON residents(apartment_number);
CREATE INDEX IF NOT EXISTS residents_status_idx ON residents(status);
CREATE INDEX IF NOT EXISTS residents_name_idx ON residents(first_name, last_name);
CREATE INDEX IF NOT EXISTS admin_users_email_idx ON admin_users(email);

-- Enable Row Level Security
ALTER TABLE residents ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies for residents table
CREATE POLICY "Admin users can view all residents" ON residents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.id = auth.uid()
        )
    );

CREATE POLICY "Admin users can insert residents" ON residents
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.id = auth.uid()
        )
    );

CREATE POLICY "Admin users can update residents" ON residents
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.id = auth.uid()
        )
    );

CREATE POLICY "Admin users can delete residents" ON residents
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.id = auth.uid()
        )
    );

-- Create policies for admin_users table
CREATE POLICY "Admin users can view their own profile" ON admin_users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Super admin can view all admin users" ON admin_users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.id = auth.uid() 
            AND admin_users.role = 'super_admin'
        )
    );

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_residents_updated_at 
    BEFORE UPDATE ON residents 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at 
    BEFORE UPDATE ON admin_users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional - remove in production)
INSERT INTO residents (first_name, last_name, email, phone, apartment_number, building, move_in_date, emergency_contact_name, emergency_contact_phone, status) VALUES
('John', 'Doe', 'john.doe@example.com', '+1234567890', '101', 'Building A', '2024-01-15', 'Jane Doe', '+1234567891', 'active'),
('Alice', 'Smith', 'alice.smith@example.com', '+1234567892', '102', 'Building A', '2024-02-01', 'Bob Smith', '+1234567893', 'active'),
('Mike', 'Johnson', 'mike.johnson@example.com', '+1234567894', '201', 'Building B', '2024-01-20', 'Sarah Johnson', '+1234567895', 'active'),
('Emma', 'Wilson', 'emma.wilson@example.com', '+1234567896', '202', 'Building B', '2023-12-10', 'Tom Wilson', '+1234567897', 'inactive'),
('David', 'Brown', 'david.brown@example.com', '+1234567898', '301', 'Building C', '2024-03-01', 'Lisa Brown', '+1234567899', 'pending')
ON CONFLICT (email) DO NOTHING;

-- Note: To create admin users, you'll need to:
-- 1. Sign up users through Supabase Auth
-- 2. Then insert their profile into admin_users table
-- Example:
-- INSERT INTO admin_users (id, email, full_name, role) VALUES 
-- ('user-uuid-from-auth', 'admin@cohub.com', 'Admin User', 'super_admin');