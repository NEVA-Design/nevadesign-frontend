INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'neva-design-portfolio',
  'neva-design-portfolio',
  true,
  12582912,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read Neva Design portfolio images" ON storage.objects;
DROP POLICY IF EXISTS "Service role full access Neva Design portfolio images" ON storage.objects;

CREATE POLICY "Public read Neva Design portfolio images"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'neva-design-portfolio');

CREATE POLICY "Service role full access Neva Design portfolio images"
  ON storage.objects FOR ALL TO service_role
  USING (bucket_id = 'neva-design-portfolio')
  WITH CHECK (bucket_id = 'neva-design-portfolio');
