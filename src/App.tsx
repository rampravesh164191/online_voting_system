import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { supabase } from './lib/supabase';
import SignIn from './components/Auth/SignIn';
import SignUp from './components/Auth/SignUp';
import ProfileSetup from './components/Profile/ProfileSetup';
import Dashboard from './components/Dashboard/Dashboard';
import VotingInterface from './components/Voting/VotingInterface';

function AppContent() {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [hasProfile, setHasProfile] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [votingElectionId, setVotingElectionId] = useState<string | null>(null);

  useEffect(() => {
    checkProfile();
    checkVotingRoute();
  }, [user]);

  const checkProfile = async () => {
    if (!user) {
      setCheckingProfile(false);
      return;
    }

    const { data } = await supabase
      .from('voter_profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    setHasProfile(!!data);
    setCheckingProfile(false);
  };

  const checkVotingRoute = () => {
    const path = window.location.pathname;
    const match = path.match(/\/vote\/([a-f0-9-]+)/);
    if (match) {
      setVotingElectionId(match[1]);
    }
  };

  if (loading || checkingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (authMode === 'signin') {
      return (
        <SignIn
          onSuccess={() => checkProfile()}
          onToggleMode={() => setAuthMode('signup')}
        />
      );
    } else {
      return (
        <SignUp
          onSuccess={() => checkProfile()}
          onToggleMode={() => setAuthMode('signin')}
        />
      );
    }
  }

  if (!hasProfile) {
    return <ProfileSetup onComplete={() => setHasProfile(true)} />;
  }

  if (votingElectionId) {
    return <VotingInterface electionId={votingElectionId} />;
  }

  return <Dashboard />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
