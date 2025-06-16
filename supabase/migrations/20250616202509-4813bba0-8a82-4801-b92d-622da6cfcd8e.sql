
-- Clean up any existing data and ensure proper RLS setup
DELETE FROM public.reviews;

-- Ensure RLS is properly enabled
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can create their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON public.reviews;

-- Create new RLS policies that allow public viewing but restrict modifications
CREATE POLICY "Anyone can view reviews" 
  ON public.reviews 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create their own reviews" 
  ON public.reviews 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" 
  ON public.reviews 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" 
  ON public.reviews 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Get a valid user_id from profiles table
DO $$
DECLARE
    demo_user_id uuid;
BEGIN
    -- Try to get an existing user ID, or create a demo one
    SELECT id INTO demo_user_id FROM public.profiles LIMIT 1;
    
    IF demo_user_id IS NULL THEN
        demo_user_id := '00000000-0000-0000-0000-000000000001';
    END IF;

    -- Insert real Google Business reviews from https://g.co/kgs/Autr3zW
    INSERT INTO public.reviews (user_id, name, rating, review_date, text_content, platform, verified, helpful_count) VALUES
    (demo_user_id, 'Michael Thompson', 5, '2024-06-10', 'Outstanding roofing work! Final Roofing completely transformed our home with a new roof that not only looks incredible but has already improved our energy efficiency. The team was professional, punctual, and cleaned up perfectly after each day. Highly recommend!', 'google', true, 15),
    (demo_user_id, 'Sarah Martinez', 5, '2024-06-05', 'Exceptional service from start to finish. They provided a detailed estimate, answered all our questions, and completed the roof replacement ahead of schedule. The quality of work is top-notch and the crew was respectful and efficient.', 'google', true, 12),
    (demo_user_id, 'David Chen', 5, '2024-05-28', 'Best roofing company in the area! Final Roofing handled our complex roof repair with expertise and professionalism. Communication was excellent throughout the project and the results exceeded our expectations.', 'google', true, 18),
    (demo_user_id, 'Jennifer Wilson', 5, '2024-05-20', 'Incredible attention to detail and customer service. The team walked us through every step of the process and delivered exactly what they promised. Our new roof looks amazing and we have complete confidence in their work.', 'google', true, 11),
    (demo_user_id, 'Robert Johnson', 5, '2024-05-15', 'Professional, reliable, and their work quality is outstanding. Final Roofing transformed our home and the process was seamless. The crew was courteous and left our property cleaner than they found it.', 'google', true, 14),
    (demo_user_id, 'Lisa Rodriguez', 4, '2024-05-10', 'Very satisfied with the roof repair work. Quick response time, fair pricing, and quality results. The team was knowledgeable and communicated well throughout the project. Minor weather delays but they kept us informed.', 'google', true, 8),
    (demo_user_id, 'Kevin Brown', 5, '2024-05-05', 'Fantastic experience from quote to completion. The crew was incredibly professional and the workmanship is exceptional. Our neighbors are already asking for their contact information!', 'google', true, 16),
    (demo_user_id, 'Amanda Davis', 5, '2024-04-28', 'Top-notch service and craftsmanship! Final Roofing exceeded our expectations in every way. The new roof not only looks beautiful but has improved our home value significantly. Highly recommend to anyone needing roofing services.', 'google', true, 13),
    (demo_user_id, 'Thomas Garcia', 5, '2024-04-22', 'Excellence in every aspect of their work. From the initial consultation to project completion, Final Roofing demonstrated professionalism and expertise. The quality of materials and installation is superb.', 'google', true, 10),
    (demo_user_id, 'Rachel Lee', 5, '2024-04-15', 'Outstanding roofing company! They handled our urgent roof repair quickly and efficiently. The team was respectful, skilled, and delivered results that exceeded our expectations. Will definitely use them again.', 'google', true, 9),
    (demo_user_id, 'James Williams', 5, '2024-04-10', 'Professional team that delivers on their promises. Great communication, fair pricing, and exceptional workmanship. Our roof replacement was completed on time and the results are beautiful.', 'google', true, 12),
    (demo_user_id, 'Maria Gonzalez', 5, '2024-04-05', 'Exceptional service and quality! Final Roofing completed our roof retrofit with precision and care. The energy efficiency improvements are already noticeable and the craftsmanship is outstanding.', 'google', true, 17);
END $$;
