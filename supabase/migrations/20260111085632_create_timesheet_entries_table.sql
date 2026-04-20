/*
  # Create Timesheet Entries Table

  1. New Tables
    - `timesheet_entries`
      - `id` (uuid, primary key) - Unique identifier for each entry
      - `user_id` (uuid) - References auth.users for multi-user support
      - `date` (date) - The work day date
      - `start_time` (time) - Start time of work
      - `end_time` (time) - End time of work
      - `break_time` (integer) - Break time in minutes
      - `hourly_rate` (numeric) - Hourly rate for payment calculation
      - `total_hours` (numeric) - Calculated total hours worked
      - `total_amount` (numeric) - Calculated total payment amount
      - `description` (text) - Optional description of work performed
      - `created_at` (timestamptz) - Timestamp when entry was created
      - `updated_at` (timestamptz) - Timestamp when entry was last updated

  2. Security
    - Enable RLS on `timesheet_entries` table
    - Add policy for authenticated users to read their own entries
    - Add policy for authenticated users to insert their own entries
    - Add policy for authenticated users to update their own entries
    - Add policy for authenticated users to delete their own entries
*/

CREATE TABLE IF NOT EXISTS timesheet_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  break_time integer DEFAULT 0,
  hourly_rate numeric(10, 2) NOT NULL,
  total_hours numeric(10, 2) NOT NULL,
  total_amount numeric(10, 2) NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE timesheet_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own timesheet entries"
  ON timesheet_entries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own timesheet entries"
  ON timesheet_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own timesheet entries"
  ON timesheet_entries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own timesheet entries"
  ON timesheet_entries
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_timesheet_entries_user_id ON timesheet_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_timesheet_entries_date ON timesheet_entries(date DESC);
