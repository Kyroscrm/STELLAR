
-- Create storage bucket for logos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow authenticated users to upload their own logos
CREATE POLICY "Users can upload their own logos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'logos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy to allow authenticated users to view their own logos
CREATE POLICY "Users can view their own logos" ON storage.objects
FOR SELECT USING (
  bucket_id = 'logos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy to allow authenticated users to update their own logos
CREATE POLICY "Users can update their own logos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'logos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy to allow authenticated users to delete their own logos
CREATE POLICY "Users can delete their own logos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'logos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
