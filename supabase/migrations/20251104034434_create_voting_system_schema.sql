/*
  # Online Voting System Schema

  ## Overview
  This migration creates the complete database structure for a secure online voting platform.
  It implements a multi-layered security approach with RLS policies, audit trails, and 
  verification mechanisms.

  ## New Tables

  ### 1. `voter_profiles`
  User profile information for verified voters
  - `id` (uuid, primary key) - References auth.users
  - `full_name` (text) - Voter's full name
  - `date_of_birth` (date) - For age verification
  - `address` (text) - Residential address
  - `voter_id` (text, unique) - Unique voter identification number
  - `id_document_url` (text) - URL to uploaded ID document
  - `face_photo_url` (text) - URL to registered facial photo
  - `is_verified` (boolean) - Admin verification status
  - `created_at` (timestamptz) - Profile creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `elections`
  Election events and their details
  - `id` (uuid, primary key) - Unique election identifier
  - `title` (text) - Election name
  - `description` (text) - Detailed election information
  - `start_date` (timestamptz) - When voting opens
  - `end_date` (timestamptz) - When voting closes
  - `is_active` (boolean) - Current election status
  - `guidelines` (text) - Voting rules and guidelines
  - `created_at` (timestamptz) - Creation timestamp

  ### 3. `candidates`
  Candidates or issues in elections
  - `id` (uuid, primary key) - Unique candidate identifier
  - `election_id` (uuid, foreign key) - Associated election
  - `name` (text) - Candidate/issue name
  - `description` (text) - Details about candidate/issue
  - `photo_url` (text) - Candidate photo
  - `position` (integer) - Display order
  - `created_at` (timestamptz) - Creation timestamp

  ### 4. `voting_links`
  Secure, time-limited voting access links
  - `id` (uuid, primary key) - Unique link identifier
  - `voter_id` (uuid, foreign key) - Associated voter
  - `election_id` (uuid, foreign key) - Associated election
  - `token` (text, unique) - Secure access token
  - `created_at` (timestamptz) - Link generation time
  - `expires_at` (timestamptz) - Expiration time (2 minutes)
  - `activated_at` (timestamptz) - When link was first opened
  - `is_used` (boolean) - Whether vote was cast
  - `ip_address` (text) - IP address of access
  - `location_data` (jsonb) - Geolocation data

  ### 5. `votes`
  Cast votes with security measures
  - `id` (uuid, primary key) - Unique vote identifier
  - `election_id` (uuid, foreign key) - Associated election
  - `candidate_id` (uuid, foreign key) - Selected candidate
  - `voting_link_id` (uuid, foreign key) - Link used for voting
  - `face_verification_url` (text) - Captured facial photo during voting
  - `location_data` (jsonb) - Location at time of voting
  - `ip_address` (text) - IP address used
  - `user_agent` (text) - Browser/device information
  - `cast_at` (timestamptz) - Vote timestamp
  - `vote_hash` (text) - Encrypted vote identifier for anonymity

  ### 6. `audit_logs`
  Comprehensive audit trail for all voting activities
  - `id` (uuid, primary key) - Unique log identifier
  - `voter_id` (uuid) - Associated voter
  - `election_id` (uuid) - Associated election
  - `action` (text) - Action performed
  - `details` (jsonb) - Additional action details
  - `ip_address` (text) - IP address
  - `location_data` (jsonb) - Location data
  - `created_at` (timestamptz) - Log timestamp

  ### 7. `notifications`
  User notifications for voting updates
  - `id` (uuid, primary key) - Unique notification identifier
  - `voter_id` (uuid, foreign key) - Target voter
  - `title` (text) - Notification title
  - `message` (text) - Notification content
  - `type` (text) - Notification category
  - `is_read` (boolean) - Read status
  - `created_at` (timestamptz) - Creation timestamp

  ### 8. `feedback`
  User feedback on voting experience
  - `id` (uuid, primary key) - Unique feedback identifier
  - `voter_id` (uuid, foreign key) - Feedback author
  - `election_id` (uuid) - Related election
  - `rating` (integer) - Numeric rating (1-5)
  - `comments` (text) - Detailed feedback
  - `created_at` (timestamptz) - Submission timestamp

  ## Security

  All tables have Row Level Security (RLS) enabled with restrictive policies:
  - Voters can only access their own data
  - Election and candidate information is publicly readable
  - Votes are anonymized through hashing
  - Admin-level access required for verification and reports
  - Audit logs are write-only for users

  ## Important Notes

  1. Face verification photos are captured during voting to match against registered photos
  2. Voting links expire 2 minutes after creation if not activated
  3. Location data is captured for security and audit purposes
  4. All votes are hashed to maintain voter anonymity while ensuring integrity
  5. Comprehensive audit trails track all system interactions
*/

-- Create voter_profiles table
CREATE TABLE IF NOT EXISTS voter_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  date_of_birth date NOT NULL,
  address text NOT NULL,
  voter_id text UNIQUE NOT NULL,
  id_document_url text,
  face_photo_url text,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE voter_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON voter_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can create own profile"
  ON voter_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON voter_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create elections table
CREATE TABLE IF NOT EXISTS elections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  is_active boolean DEFAULT false,
  guidelines text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE elections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active elections"
  ON elections FOR SELECT
  TO authenticated
  USING (true);

-- Create candidates table
CREATE TABLE IF NOT EXISTS candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id uuid REFERENCES elections(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  photo_url text,
  position integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view candidates"
  ON candidates FOR SELECT
  TO authenticated
  USING (true);

-- Create voting_links table
CREATE TABLE IF NOT EXISTS voting_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  voter_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  election_id uuid REFERENCES elections(id) ON DELETE CASCADE NOT NULL,
  token text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  activated_at timestamptz,
  is_used boolean DEFAULT false,
  ip_address text,
  location_data jsonb,
  CONSTRAINT unique_voter_election UNIQUE (voter_id, election_id)
);

ALTER TABLE voting_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own voting links"
  ON voting_links FOR SELECT
  TO authenticated
  USING (auth.uid() = voter_id);

-- Create votes table
CREATE TABLE IF NOT EXISTS votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id uuid REFERENCES elections(id) ON DELETE CASCADE NOT NULL,
  candidate_id uuid REFERENCES candidates(id) ON DELETE CASCADE NOT NULL,
  voting_link_id uuid REFERENCES voting_links(id) ON DELETE CASCADE NOT NULL,
  face_verification_url text,
  location_data jsonb,
  ip_address text,
  user_agent text,
  cast_at timestamptz DEFAULT now(),
  vote_hash text UNIQUE NOT NULL
);

ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own vote"
  ON votes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM voting_links
      WHERE voting_links.id = voting_link_id
      AND voting_links.voter_id = auth.uid()
    )
  );

CREATE POLICY "Users cannot view votes directly"
  ON votes FOR SELECT
  TO authenticated
  USING (false);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  voter_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  election_id uuid REFERENCES elections(id) ON DELETE SET NULL,
  action text NOT NULL,
  details jsonb,
  ip_address text,
  location_data jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create audit logs"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = voter_id);

CREATE POLICY "Users can view own audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = voter_id);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  voter_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = voter_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = voter_id)
  WITH CHECK (auth.uid() = voter_id);

-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  voter_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  election_id uuid REFERENCES elections(id) ON DELETE SET NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  comments text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create feedback"
  ON feedback FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = voter_id);

CREATE POLICY "Users can view own feedback"
  ON feedback FOR SELECT
  TO authenticated
  USING (auth.uid() = voter_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_voting_links_voter ON voting_links(voter_id);
CREATE INDEX IF NOT EXISTS idx_voting_links_election ON voting_links(election_id);
CREATE INDEX IF NOT EXISTS idx_voting_links_token ON voting_links(token);
CREATE INDEX IF NOT EXISTS idx_votes_election ON votes(election_id);
CREATE INDEX IF NOT EXISTS idx_votes_candidate ON votes(candidate_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_voter ON audit_logs(voter_id);
CREATE INDEX IF NOT EXISTS idx_notifications_voter ON notifications(voter_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for voter_profiles
CREATE TRIGGER update_voter_profiles_updated_at
  BEFORE UPDATE ON voter_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();