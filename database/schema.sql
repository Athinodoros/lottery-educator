-- Lottery Educator Database Schema
-- PostgreSQL 12+
-- All timestamps use UTC

-- Games table: Defines available lottery games
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  number_range INTEGER[] NOT NULL, -- [min, max]
  numbers_to_select INTEGER NOT NULL,
  extra_numbers INTEGER, -- For games with bonus numbers (e.g., Powerball)
  probability_of_winning NUMERIC(20, 19), -- Scientific notation for very small odds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Game results table: Records individual game plays
-- One table per game type to manage data volume
CREATE TABLE IF NOT EXISTS game_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE RESTRICT,
  selected_numbers INTEGER[] NOT NULL,
  winning_numbers INTEGER[] NOT NULL,
  extra_number INTEGER, -- Bonus/extra number if applicable
  draws_to_win INTEGER NOT NULL, -- How many draws until winning (1 = won immediately)
  is_winner BOOLEAN GENERATED ALWAYS AS (draws_to_win = 1) STORED,
  played_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Email/Contact form submissions
-- Soft delete support for GDPR "Forget Me" compliance
CREATE TABLE IF NOT EXISTS emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE, -- Soft delete timestamp
  deleted_reason VARCHAR(255) -- Why was it deleted (e.g., 'user_request', 'system')
);

-- Click metrics: Tracks user interactions on the platform
-- No IP addresses stored (GDPR compliant)
CREATE TABLE IF NOT EXISTS click_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id VARCHAR(255) NOT NULL, -- Identifies what was clicked (button, page, etc.)
  user_session_id UUID, -- Anonymous session ID (from browser storage)
  click_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(link_id, user_session_id, DATE(created_at)) -- Prevent duplicate daily counts
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_game_results_game_id ON game_results(game_id);
CREATE INDEX IF NOT EXISTS idx_game_results_created_at ON game_results(created_at);
CREATE INDEX IF NOT EXISTS idx_game_results_is_winner ON game_results(is_winner);
CREATE INDEX IF NOT EXISTS idx_emails_created_at ON emails(created_at);
CREATE INDEX IF NOT EXISTS idx_emails_is_deleted ON emails(is_deleted);
CREATE INDEX IF NOT EXISTS idx_click_metrics_link_id ON click_metrics(link_id);
CREATE INDEX IF NOT EXISTS idx_click_metrics_user_session_id ON click_metrics(user_session_id);
CREATE INDEX IF NOT EXISTS idx_click_metrics_created_at ON click_metrics(created_at);

-- View for aggregated game statistics
CREATE OR REPLACE VIEW game_statistics AS
SELECT
  gr.game_id,
  g.name,
  COUNT(*) as total_plays,
  COUNT(CASE WHEN gr.is_winner THEN 1 END) as total_wins,
  ROUND(AVG(gr.draws_to_win), 2) as avg_draws_to_win,
  MAX(gr.draws_to_win) as max_draws_to_win,
  MIN(gr.draws_to_win) as min_draws_to_win,
  ROUND(COUNT(CASE WHEN gr.is_winner THEN 1 END)::NUMERIC / COUNT(*) * 100, 4) as win_rate_percent,
  MAX(gr.created_at) as last_play_at
FROM game_results gr
JOIN games g ON gr.game_id = g.id
WHERE gr.is_deleted IS FALSE OR gr.is_deleted IS NULL
GROUP BY gr.game_id, g.name;

-- View for click metrics summary
CREATE OR REPLACE VIEW click_metrics_summary AS
SELECT
  link_id,
  COUNT(DISTINCT user_session_id) as unique_sessions,
  COUNT(*) as total_clicks,
  ROUND(AVG(click_count), 2) as avg_clicks_per_session,
  MAX(updated_at) as last_click_at
FROM click_metrics
WHERE deleted_at IS NULL
GROUP BY link_id;

-- Update timestamps trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for games table
CREATE TRIGGER update_games_timestamp
BEFORE UPDATE ON games
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for click_metrics table
CREATE TRIGGER update_click_metrics_timestamp
BEFORE UPDATE ON click_metrics
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE games IS 'Lottery game definitions with odds and parameters';
COMMENT ON TABLE game_results IS 'Individual game plays and draw outcomes';
COMMENT ON TABLE emails IS 'Contact form submissions (soft-deletable for GDPR)';
COMMENT ON TABLE click_metrics IS 'User interaction metrics (no IP tracking)';
COMMENT ON VIEW game_statistics IS 'Aggregated statistics per game type';
COMMENT ON VIEW click_metrics_summary IS 'Aggregated click tracking metrics';
