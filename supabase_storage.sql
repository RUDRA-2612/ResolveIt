-- Safe, repeatable setup for public issue evidence images.
-- Run this separately in the Supabase SQL Editor; do not rerun supabase_schema.sql
-- on an existing project because that script drops and recreates application tables.

INSERT INTO storage.buckets (id, name, public)
VALUES ('evidence', 'evidence', TRUE)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

DROP POLICY IF EXISTS "authenticated_upload_own_evidence" ON storage.objects;
CREATE POLICY "authenticated_upload_own_evidence"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'evidence'
  AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
);

DROP POLICY IF EXISTS "authenticated_delete_own_evidence" ON storage.objects;
CREATE POLICY "authenticated_delete_own_evidence"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'evidence'
  AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
);
