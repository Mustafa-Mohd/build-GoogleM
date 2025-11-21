-- Create business_cards table
CREATE TABLE public.business_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  front_image_url TEXT NOT NULL,
  back_image_url TEXT,
  full_name TEXT NOT NULL,
  company TEXT,
  designation TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.business_cards ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for now (will be restricted with auth later)
CREATE POLICY "Allow all operations on business_cards for now" 
ON public.business_cards 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_business_cards_updated_at
BEFORE UPDATE ON public.business_cards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_business_cards_user_id ON public.business_cards(user_id);
CREATE INDEX idx_business_cards_created_at ON public.business_cards(created_at DESC);