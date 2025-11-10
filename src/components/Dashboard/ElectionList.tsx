import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Calendar, Users, ExternalLink, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface Election {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  guidelines: string | null;
}

interface ElectionListProps {
  isVerified: boolean;
}

export default function ElectionList({ isVerified }: ElectionListProps) {
  const { user } = useAuth();
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedElection, setSelectedElection] = useState<Election | null>(null);

  useEffect(() => {
    loadElections();
  }, []);

  const loadElections = async () => {
    const { data } = await supabase
      .from('elections')
      .select('*')
      .eq('is_active', true)
      .order('start_date', { ascending: false });

    setElections(data || []);
    setLoading(false);
  };

  const checkVotingStatus = async (electionId: string) => {
    const { data } = await supabase
      .from('voting_links')
      .select('is_used')
      .eq('voter_id', user?.id)
      .eq('election_id', electionId)
      .maybeSingle();

    return data?.is_used || false;
  };

  const requestVotingLink = async (electionId: string) => {
    if (!isVerified) {
      alert('Your profile must be verified before you can vote.');
      return;
    }

    try {
      const hasVoted = await checkVotingStatus(electionId);
      if (hasVoted) {
        alert('You have already voted in this election.');
        return;
      }

      window.location.href = `/vote/${electionId}`;
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to initiate voting process.');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading elections...</p>
      </div>
    );
  }

  if (elections.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Active Elections</h3>
        <p className="text-gray-600">There are no active elections at the moment. Check back later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!isVerified && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-yellow-800">Profile Verification Required</h4>
            <p className="text-sm text-yellow-700 mt-1">
              Your profile must be verified by administrators before you can participate in voting.
            </p>
          </div>
        </div>
      )}

      {elections.map((election) => (
        <div key={election.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{election.title}</h3>
              <p className="text-gray-600 mb-4">{election.description}</p>

              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>
                    {new Date(election.start_date).toLocaleDateString()} - {new Date(election.end_date).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {election.guidelines && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Voting Guidelines</h4>
                  <p className="text-sm text-blue-800">{election.guidelines}</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedElection(election)}
              className="ml-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
            >
              View Details
            </button>
          </div>
        </div>
      ))}

      {selectedElection && (
        <ElectionModal
          election={selectedElection}
          onClose={() => setSelectedElection(null)}
          onVote={() => requestVotingLink(selectedElection.id)}
          isVerified={isVerified}
        />
      )}
    </div>
  );
}

interface ElectionModalProps {
  election: Election;
  onClose: () => void;
  onVote: () => void;
  isVerified: boolean;
}

function ElectionModal({ election, onClose, onVote, isVerified }: ElectionModalProps) {
  const [candidates, setCandidates] = useState<any[]>([]);

  useEffect(() => {
    loadCandidates();
  }, [election.id]);

  const loadCandidates = async () => {
    const { data } = await supabase
      .from('candidates')
      .select('*')
      .eq('election_id', election.id)
      .order('position');

    setCandidates(data || []);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">{election.title}</h2>
          <p className="text-gray-600 mb-6">{election.description}</p>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Candidates</h3>
            <div className="space-y-4">
              {candidates.map((candidate) => (
                <div key={candidate.id} className="flex items-start p-4 border border-gray-200 rounded-lg">
                  <Users className="w-8 h-8 text-blue-600 mr-4 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-800">{candidate.name}</h4>
                    {candidate.description && (
                      <p className="text-sm text-gray-600 mt-1">{candidate.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={onVote}
              disabled={!isVerified}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              Proceed to Vote
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
