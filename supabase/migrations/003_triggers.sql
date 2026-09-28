-- Migration 003: Database Triggers and Functions
-- Creates triggers for automatic profile creation, updated_at timestamps, and activity logging

-- Function to auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on auth user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update leads.updated_at
DROP TRIGGER IF EXISTS update_leads_updated_at ON public.leads;
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to update users.updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to log lead activity
CREATE OR REPLACE FUNCTION public.log_lead_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.activities (lead_id, user_id, type, description)
    VALUES (NEW.id, NEW.user_id, 'created', 'Lead created');
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      INSERT INTO public.activities (lead_id, user_id, type, description, metadata)
      VALUES (NEW.id, NEW.user_id, 'status_changed', 'Status changed', jsonb_build_object('from', OLD.status, 'to', NEW.status));
    ELSE
      INSERT INTO public.activities (lead_id, user_id, type, description)
      VALUES (NEW.id, NEW.user_id, 'updated', 'Lead updated');
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to log lead activity on insert/update
DROP TRIGGER IF EXISTS trigger_log_lead_activity ON public.leads;
CREATE TRIGGER trigger_log_lead_activity
  AFTER INSERT OR UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.log_lead_activity();