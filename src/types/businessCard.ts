export interface BusinessCard {
  id: string;
  user_id?: string;
  front_image_url: string;
  back_image_url?: string;
  full_name: string;
  company?: string;
  designation?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}
