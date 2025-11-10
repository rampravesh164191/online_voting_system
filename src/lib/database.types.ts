export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      voter_profiles: {
        Row: {
          id: string;
          full_name: string;
          date_of_birth: string;
          address: string;
          voter_id: string;
          id_document_url: string | null;
          face_photo_url: string | null;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          date_of_birth: string;
          address: string;
          voter_id: string;
          id_document_url?: string | null;
          face_photo_url?: string | null;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          date_of_birth?: string;
          address?: string;
          voter_id?: string;
          id_document_url?: string | null;
          face_photo_url?: string | null;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      elections: {
        Row: {
          id: string;
          title: string;
          description: string;
          start_date: string;
          end_date: string;
          is_active: boolean;
          guidelines: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          start_date: string;
          end_date: string;
          is_active?: boolean;
          guidelines?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          start_date?: string;
          end_date?: string;
          is_active?: boolean;
          guidelines?: string | null;
          created_at?: string;
        };
      };
      candidates: {
        Row: {
          id: string;
          election_id: string;
          name: string;
          description: string | null;
          photo_url: string | null;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          election_id: string;
          name: string;
          description?: string | null;
          photo_url?: string | null;
          position?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          election_id?: string;
          name?: string;
          description?: string | null;
          photo_url?: string | null;
          position?: number;
          created_at?: string;
        };
      };
      voting_links: {
        Row: {
          id: string;
          voter_id: string;
          election_id: string;
          token: string;
          created_at: string;
          expires_at: string;
          activated_at: string | null;
          is_used: boolean;
          ip_address: string | null;
          location_data: Json | null;
        };
        Insert: {
          id?: string;
          voter_id: string;
          election_id: string;
          token: string;
          created_at?: string;
          expires_at: string;
          activated_at?: string | null;
          is_used?: boolean;
          ip_address?: string | null;
          location_data?: Json | null;
        };
        Update: {
          id?: string;
          voter_id?: string;
          election_id?: string;
          token?: string;
          created_at?: string;
          expires_at?: string;
          activated_at?: string | null;
          is_used?: boolean;
          ip_address?: string | null;
          location_data?: Json | null;
        };
      };
      votes: {
        Row: {
          id: string;
          election_id: string;
          candidate_id: string;
          voting_link_id: string;
          face_verification_url: string | null;
          location_data: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          cast_at: string;
          vote_hash: string;
        };
        Insert: {
          id?: string;
          election_id: string;
          candidate_id: string;
          voting_link_id: string;
          face_verification_url?: string | null;
          location_data?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          cast_at?: string;
          vote_hash: string;
        };
        Update: {
          id?: string;
          election_id?: string;
          candidate_id?: string;
          voting_link_id?: string;
          face_verification_url?: string | null;
          location_data?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          cast_at?: string;
          vote_hash?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          voter_id: string | null;
          election_id: string | null;
          action: string;
          details: Json | null;
          ip_address: string | null;
          location_data: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          voter_id?: string | null;
          election_id?: string | null;
          action: string;
          details?: Json | null;
          ip_address?: string | null;
          location_data?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          voter_id?: string | null;
          election_id?: string | null;
          action?: string;
          details?: Json | null;
          ip_address?: string | null;
          location_data?: Json | null;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          voter_id: string;
          title: string;
          message: string;
          type: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          voter_id: string;
          title: string;
          message: string;
          type: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          voter_id?: string;
          title?: string;
          message?: string;
          type?: string;
          is_read?: boolean;
          created_at?: string;
        };
      };
      feedback: {
        Row: {
          id: string;
          voter_id: string;
          election_id: string | null;
          rating: number | null;
          comments: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          voter_id: string;
          election_id?: string | null;
          rating?: number | null;
          comments?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          voter_id?: string;
          election_id?: string | null;
          rating?: number | null;
          comments?: string | null;
          created_at?: string;
        };
      };
    };
  };
}
