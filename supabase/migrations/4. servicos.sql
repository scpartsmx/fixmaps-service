
-- Create a table for service types
CREATE TABLE public.service_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to ensure only authenticated users can access
ALTER TABLE public.service_types ENABLE ROW LEVEL SECURITY;

-- Create policy that allows authenticated users to SELECT service types
CREATE POLICY "Authenticated users can view service types" 
  ON public.service_types 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- Create policy that allows authenticated users to INSERT service types
CREATE POLICY "Authenticated users can insert service types" 
  ON public.service_types 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Create policy that allows authenticated users to UPDATE service types
CREATE POLICY "Authenticated users can update service types" 
  ON public.service_types 
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL);

-- Create policy that allows authenticated users to DELETE service types
CREATE POLICY "Authenticated users can delete service types" 
  ON public.service_types 
  FOR DELETE 
  USING (auth.uid() IS NOT NULL);

-- Create trigger to automatically update the updated_at column
CREATE TRIGGER set_service_types_updated_at
  BEFORE UPDATE ON public.service_types
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
