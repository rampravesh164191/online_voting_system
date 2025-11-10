import { supabase } from '../lib/supabase';
import { getCurrentLocation } from './location';

export async function logAuditEvent(
  action: string,
  details?: Record<string, unknown>,
  electionId?: string
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const location = await getCurrentLocation();

    await supabase.from('audit_logs').insert({
      voter_id: user.id,
      election_id: electionId || null,
      action,
      details: details || null,
      ip_address: null,
      location_data: location || null,
    });
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
}
