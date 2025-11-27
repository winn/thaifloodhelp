-- Create storage bucket for help request images
INSERT INTO storage.buckets (id, name, public)
VALUES ('help-images', 'help-images', true);

-- Allow anyone to upload images
CREATE POLICY "Anyone can upload help images"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'help-images');

-- Allow anyone to view images
CREATE POLICY "Anyone can view help images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'help-images');

-- Allow users to delete their own images
CREATE POLICY "Users can delete their own images"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'help-images');