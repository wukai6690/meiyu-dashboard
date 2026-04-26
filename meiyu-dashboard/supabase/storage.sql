-- Storage: 创建作品图片存储桶
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('artworks', 'artworks', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT DO NOTHING;

DROP POLICY IF EXISTS "Public artwork images access" ON storage.objects;
CREATE POLICY "Public artwork images access" ON storage.objects FOR SELECT USING (bucket_id = 'artworks');

DROP POLICY IF EXISTS "Authenticated users can upload artwork" ON storage.objects;
CREATE POLICY "Authenticated users can upload artwork" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'artworks' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update own artwork" ON storage.objects;
CREATE POLICY "Users can update own artwork" ON storage.objects FOR UPDATE USING (bucket_id = 'artworks' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can delete own artwork" ON storage.objects;
CREATE POLICY "Users can delete own artwork" ON storage.objects FOR DELETE USING (bucket_id = 'artworks' AND auth.uid()::text = (storage.foldername(name))[1]);
