import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface VotingLink {
  id: string;
  election_id: string;
  is_used: boolean;
  created_at: string;
  activated_at: string | null;
  elections: {
    title: string;
  };
}

export default function VoteTracking() {
  const { user } = useAuth();
  const [votingLinks, setVotingLinks] = useState<VotingLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVotingLinks();
  }, [user]);

  const loadVotingLinks = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('voting_links')
      .select('*, elections(title)')
      .eq('voter_id', user.id)
      .order('created_at', { ascending: false });

    setVotingLinks(data || []);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading voting history...</p>
      </div>
    );
  }

  if (votingLinks.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Voting History</h3>
        <p className="text-gray-600">You haven't participated in any elections yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {votingLinks.map((link) => (
        <div key={link.id} className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {link.elections.title}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>Link generated: {new Date(link.created_at).toLocaleString()}</span>
                </div>
                {link.activated_at && (
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>Activated: {new Date(link.activated_at).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="ml-4">
              {link.is_used ? (
                <div className="flex items-center text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span className="font-semibold">Vote Cast</span>
                </div>
              ) : (
                <div className="flex items-center text-yellow-600 bg-yellow-50 px-4 py-2 rounded-lg">
                  <Clock className="w-5 h-5 mr-2" />
                  <span className="font-semibold">Pending</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
