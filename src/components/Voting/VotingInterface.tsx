import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Camera, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { getCurrentLocation } from '../../utils/location';
import { generateVoteHash, generateSecureToken } from '../../utils/crypto';
import { logAuditEvent } from '../../utils/audit';

interface VotingInterfaceProps {
  electionId: string;
}

export default function VotingInterface({ electionId }: VotingInterfaceProps) {
  const { user } = useAuth();
  const [election, setElection] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [votingLink, setVotingLink] = useState<any>(null);
  const [step, setStep] = useState<'init' | 'verify' | 'select' | 'confirm' | 'success'>('init');
  const [facePhoto, setFacePhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(120);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    initializeVoting();
  }, [electionId, user]);

  useEffect(() => {
    if (votingLink && !votingLink.is_used) {
      const expiryTime = new Date(votingLink.expires_at).getTime();
      const timer = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((expiryTime - now) / 1000));
        setTimeRemaining(remaining);

        if (remaining === 0) {
          setError('Voting link has expired. Please request a new one.');
          clearInterval(timer);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [votingLink]);

  const initializeVoting = async () => {
    if (!user) return;

    try {
      const { data: electionData } = await supabase
        .from('elections')
        .select('*')
        .eq('id', electionId)
        .single();

      setElection(electionData);

      const { data: candidatesData } = await supabase
        .from('candidates')
        .select('*')
        .eq('election_id', electionId)
        .order('position');

      setCandidates(candidatesData || []);

      let link = await getOrCreateVotingLink();

      if (link?.is_used) {
        setError('You have already voted in this election.');
        return;
      }

      setVotingLink(link);
      setStep('verify');

      await logAuditEvent('voting_initiated', { election_id: electionId }, electionId);
    } catch (err) {
      setError('Failed to initialize voting process.');
      console.error(err);
    }
  };

  const getOrCreateVotingLink = async () => {
    const { data: existingLink } = await supabase
      .from('voting_links')
      .select('*')
      .eq('voter_id', user!.id)
      .eq('election_id', electionId)
      .maybeSingle();

    if (existingLink) {
      const expiryTime = new Date(existingLink.expires_at).getTime();
      if (Date.now() < expiryTime && !existingLink.is_used) {
        return existingLink;
      }
    }

    const token = generateSecureToken();
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000).toISOString();

    const { data: newLink, error } = await supabase
      .from('voting_links')
      .upsert({
        voter_id: user!.id,
        election_id: electionId,
        token,
        expires_at: expiresAt,
      }, {
        onConflict: 'voter_id,election_id'
      })
      .select()
      .single();

    if (error) throw error;
    return newLink;
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError('Failed to access camera. Please allow camera permissions.');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const photoData = canvasRef.current.toDataURL('image/jpeg');
        setFacePhoto(photoData);

        const stream = videoRef.current.srcObject as MediaStream;
        stream?.getTracks().forEach(track => track.stop());

        setStep('select');
      }
    }
  };

  const handleVoteSubmit = async () => {
    if (!selectedCandidate || !user) return;

    setLoading(true);
    setError('');

    try {
      const location = await getCurrentLocation();
      const voteHash = await generateVoteHash(
        user.id,
        electionId,
        selectedCandidate,
        Date.now()
      );

      let faceVerificationUrl = null;
      if (facePhoto) {
        const blob = await fetch(facePhoto).then(r => r.blob());
        const fileName = `${user.id}/vote-${Date.now()}.jpg`;
        const { data: uploadData } = await supabase.storage
          .from('photos')
          .upload(fileName, blob);

        if (uploadData) {
          const { data: { publicUrl } } = supabase.storage
            .from('photos')
            .getPublicUrl(uploadData.path);
          faceVerificationUrl = publicUrl;
        }
      }

      const { error: voteError } = await supabase.from('votes').insert({
        election_id: electionId,
        candidate_id: selectedCandidate,
        voting_link_id: votingLink.id,
        face_verification_url: faceVerificationUrl,
        location_data: location,
        ip_address: null,
        user_agent: navigator.userAgent,
        vote_hash: voteHash,
      });

      if (voteError) throw voteError;

      await supabase
        .from('voting_links')
        .update({ is_used: true, activated_at: new Date().toISOString() })
        .eq('id', votingLink.id);

      await supabase.from('notifications').insert({
        voter_id: user.id,
        title: 'Vote Submitted Successfully',
        message: `Your vote in ${election.title} has been recorded securely.`,
        type: 'success',
      });

      await logAuditEvent('vote_cast', {
        election_id: electionId,
        vote_hash: voteHash,
      }, electionId);

      setStep('success');
    } catch (err) {
      setError('Failed to submit vote. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (error && step === 'init') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Voting Unavailable</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Vote Submitted Successfully!</h2>
          <p className="text-gray-600 mb-6">
            Your vote has been securely recorded. Thank you for participating in this election.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (step === 'verify') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <Camera className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Facial Verification</h2>
              <p className="text-gray-600">
                Please allow camera access to verify your identity before voting.
              </p>
              <div className="mt-4 inline-flex items-center bg-yellow-50 border border-yellow-200 px-4 py-2 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600 mr-2" />
                <span className="text-yellow-800 font-semibold">
                  Time remaining: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                </span>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {!facePhoto ? (
              <div>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full rounded-lg mb-4 bg-gray-900"
                  onLoadedMetadata={startCamera}
                />
                <canvas ref={canvasRef} className="hidden" />
                <button
                  onClick={capturePhoto}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition"
                >
                  Capture Photo
                </button>
              </div>
            ) : (
              <div>
                <img src={facePhoto} alt="Captured" className="w-full rounded-lg mb-4" />
                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      setFacePhoto(null);
                      startCamera();
                    }}
                    className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-50 transition"
                  >
                    Retake
                  </button>
                  <button
                    onClick={() => setStep('select')}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (step === 'select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">{election?.title}</h2>
              <p className="text-gray-600">Select your preferred candidate</p>
              <div className="mt-4 inline-flex items-center bg-yellow-50 border border-yellow-200 px-4 py-2 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600 mr-2" />
                <span className="text-yellow-800 font-semibold">
                  Time remaining: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                </span>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              {candidates.map((candidate) => (
                <button
                  key={candidate.id}
                  onClick={() => setSelectedCandidate(candidate.id)}
                  className={`w-full p-6 border-2 rounded-xl text-left transition ${
                    selectedCandidate === candidate.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">{candidate.name}</h3>
                      {candidate.description && (
                        <p className="text-gray-600 mt-2">{candidate.description}</p>
                      )}
                    </div>
                    {selectedCandidate === candidate.id && (
                      <CheckCircle className="w-8 h-8 text-blue-600 flex-shrink-0 ml-4" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep('confirm')}
              disabled={!selectedCandidate}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Confirm
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'confirm') {
    const selected = candidates.find(c => c.id === selectedCandidate);
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Confirm Your Vote</h2>
              <p className="text-gray-600">Please review your selection before submitting</p>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Your Selection</h3>
              <p className="text-2xl font-bold text-blue-600">{selected?.name}</p>
              {selected?.description && (
                <p className="text-gray-600 mt-2">{selected.description}</p>
              )}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> Once submitted, your vote cannot be changed. Please ensure your selection is correct.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <div className="flex space-x-4">
              <button
                onClick={() => setStep('select')}
                className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-50 transition"
              >
                Back
              </button>
              <button
                onClick={handleVoteSubmit}
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit Vote'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
