-- App settings table: single-row key/value JSON store for editable app config
CREATE TABLE public.app_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Anyone (even anon) can read app settings since they drive the UI for all visitors
CREATE POLICY "app_settings_public_read" ON public.app_settings
  FOR SELECT USING (true);

CREATE POLICY "app_settings_admin_insert" ON public.app_settings
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "app_settings_admin_update" ON public.app_settings
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "app_settings_admin_delete" ON public.app_settings
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Public storage bucket for app branding (logo, custom icons)
INSERT INTO storage.buckets (id, name, public) VALUES ('app-assets', 'app-assets', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "app_assets_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'app-assets');

CREATE POLICY "app_assets_admin_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'app-assets' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "app_assets_admin_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'app-assets' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "app_assets_admin_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'app-assets' AND has_role(auth.uid(), 'admin'::app_role));