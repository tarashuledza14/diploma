-- Enable Row Level Security on organization-scoped tables
ALTER TABLE "clients" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "vehicles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "parts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "services" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "documents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "manual_original_chunks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "team_invites" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "app_settings" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS org_isolation ON "clients";
DROP POLICY IF EXISTS org_isolation ON "vehicles";
DROP POLICY IF EXISTS org_isolation ON "parts";
DROP POLICY IF EXISTS org_isolation ON "services";
DROP POLICY IF EXISTS org_isolation ON "documents";
DROP POLICY IF EXISTS org_isolation ON "manual_original_chunks";
DROP POLICY IF EXISTS org_isolation ON "team_invites";
DROP POLICY IF EXISTS org_isolation ON "app_settings";

-- Policy: when app.current_org_id is not set, all rows are visible (internal ops, migrations, seeding).
-- When app.current_org_id is set, only rows matching that org are visible.
CREATE POLICY org_isolation ON "clients"
  AS PERMISSIVE FOR ALL
  USING (
    current_setting('app.current_org_id', true) IS NULL
    OR current_setting('app.current_org_id', true) = ''
    OR organization_id = current_setting('app.current_org_id', true)
  );

CREATE POLICY org_isolation ON "vehicles"
  AS PERMISSIVE FOR ALL
  USING (
    current_setting('app.current_org_id', true) IS NULL
    OR current_setting('app.current_org_id', true) = ''
    OR organization_id = current_setting('app.current_org_id', true)
  );

CREATE POLICY org_isolation ON "parts"
  AS PERMISSIVE FOR ALL
  USING (
    current_setting('app.current_org_id', true) IS NULL
    OR current_setting('app.current_org_id', true) = ''
    OR organization_id = current_setting('app.current_org_id', true)
  );

CREATE POLICY org_isolation ON "services"
  AS PERMISSIVE FOR ALL
  USING (
    current_setting('app.current_org_id', true) IS NULL
    OR current_setting('app.current_org_id', true) = ''
    OR organization_id = current_setting('app.current_org_id', true)
  );

CREATE POLICY org_isolation ON "documents"
  AS PERMISSIVE FOR ALL
  USING (
    current_setting('app.current_org_id', true) IS NULL
    OR current_setting('app.current_org_id', true) = ''
    OR organization_id = current_setting('app.current_org_id', true)
  );

CREATE POLICY org_isolation ON "manual_original_chunks"
  AS PERMISSIVE FOR ALL
  USING (
    current_setting('app.current_org_id', true) IS NULL
    OR current_setting('app.current_org_id', true) = ''
    OR organization_id = current_setting('app.current_org_id', true)
  );

CREATE POLICY org_isolation ON "team_invites"
  AS PERMISSIVE FOR ALL
  USING (
    current_setting('app.current_org_id', true) IS NULL
    OR current_setting('app.current_org_id', true) = ''
    OR organization_id = current_setting('app.current_org_id', true)
  );

CREATE POLICY org_isolation ON "app_settings"
  AS PERMISSIVE FOR ALL
  USING (
    current_setting('app.current_org_id', true) IS NULL
    OR current_setting('app.current_org_id', true) = ''
    OR organization_id = current_setting('app.current_org_id', true)
  );
