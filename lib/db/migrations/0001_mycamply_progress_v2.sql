CREATE TABLE IF NOT EXISTS mycamply_progress_v2 (
  key_hash text PRIMARY KEY,
  state jsonb NOT NULL,
  revision text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
