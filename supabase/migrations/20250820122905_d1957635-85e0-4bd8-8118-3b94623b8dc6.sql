-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE public.issue_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE public.issue_status AS ENUM ('pending', 'in-progress', 'resolved');
CREATE TYPE public.user_role AS ENUM ('resident', 'manager', 'maintenance');

-- Create profiles table (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'resident',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create buildings table
CREATE TABLE public.buildings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  description TEXT,
  total_units INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create units table
CREATE TABLE public.units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  building_id UUID REFERENCES public.buildings(id) ON DELETE CASCADE,
  unit_number TEXT NOT NULL,
  floor INTEGER,
  max_occupants INTEGER DEFAULT 1,
  monthly_rent DECIMAL(10,2),
  is_occupied BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(building_id, unit_number)
);

-- Create residents table (links users to units)
CREATE TABLE public.residents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
  lease_start_date DATE,
  lease_end_date DATE,
  is_primary_tenant BOOLEAN DEFAULT false,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create issue categories table
CREATE TABLE public.issue_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#6b7280',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create issues table
CREATE TABLE public.issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES public.issue_categories(id) ON DELETE SET NULL,
  priority issue_priority NOT NULL DEFAULT 'medium',
  status issue_status NOT NULL DEFAULT 'pending',
  submitted_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
  building_id UUID REFERENCES public.buildings(id) ON DELETE CASCADE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create issue comments table
CREATE TABLE public.issue_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  issue_id UUID REFERENCES public.issues(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.residents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issue_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issue_comments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Create RLS policies for buildings (all authenticated users can view)
CREATE POLICY "All users can view buildings" ON public.buildings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Only managers can modify buildings" ON public.buildings FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'manager'));

-- Create RLS policies for units
CREATE POLICY "All users can view units" ON public.units FOR SELECT TO authenticated USING (true);
CREATE POLICY "Only managers can modify units" ON public.units FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'manager'));

-- Create RLS policies for residents
CREATE POLICY "Users can view residents in their building" ON public.residents FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.residents r
    JOIN public.units u ON r.unit_id = u.id
    WHERE r.user_id = auth.uid()
  )
);
CREATE POLICY "Only managers can modify residents" ON public.residents FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'manager'));

-- Create RLS policies for issue categories (all can view)
CREATE POLICY "All users can view issue categories" ON public.issue_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Only managers can modify categories" ON public.issue_categories FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'manager'));

-- Create RLS policies for issues
CREATE POLICY "Users can view issues in their building" ON public.issues FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.residents r
    JOIN public.units u ON r.unit_id = u.id
    WHERE r.user_id = auth.uid() AND u.building_id = issues.building_id
  ) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('manager', 'maintenance'))
);

CREATE POLICY "Residents can create issues" ON public.issues FOR INSERT TO authenticated WITH CHECK (
  submitted_by = auth.uid() AND
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'resident')
);

CREATE POLICY "Staff can update issues" ON public.issues FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('manager', 'maintenance'))
);

-- Create RLS policies for issue comments
CREATE POLICY "Users can view comments for accessible issues" ON public.issue_comments FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.issues i
    JOIN public.residents r ON i.building_id = (
      SELECT u.building_id FROM public.units u WHERE u.id = r.unit_id
    )
    WHERE i.id = issue_comments.issue_id AND r.user_id = auth.uid()
  ) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('manager', 'maintenance'))
);

CREATE POLICY "Users can create comments on accessible issues" ON public.issue_comments FOR INSERT TO authenticated WITH CHECK (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.issues i
    JOIN public.residents r ON i.building_id = (
      SELECT u.building_id FROM public.units u WHERE u.id = r.unit_id
    )
    WHERE i.id = issue_comments.issue_id AND r.user_id = auth.uid()
  ) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('manager', 'maintenance'))
);

-- Create function to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_buildings_updated_at BEFORE UPDATE ON public.buildings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_units_updated_at BEFORE UPDATE ON public.units
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_residents_updated_at BEFORE UPDATE ON public.residents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_issues_updated_at BEFORE UPDATE ON public.issues
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'resident'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default issue categories
INSERT INTO public.issue_categories (name, description, color) VALUES
  ('Maintenance', 'General maintenance and repair issues', '#ef4444'),
  ('Utilities', 'Water, electricity, internet, and other utility issues', '#3b82f6'),
  ('Security', 'Security and safety related concerns', '#f59e0b'),
  ('Cleaning', 'Cleaning and housekeeping issues', '#10b981'),
  ('Noise', 'Noise complaints and disturbances', '#8b5cf6'),
  ('Other', 'Other general issues', '#6b7280');

-- Insert a default building for demo purposes
INSERT INTO public.buildings (name, address, description, total_units) VALUES
  ('Main Coliving Space', '123 Community Street, City, State 12345', 'Primary coliving building with shared spaces and amenities', 20);