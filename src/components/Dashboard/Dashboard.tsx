import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Vote, Calendar, Bell, LogOut, User } from 'lucide-react';
import ElectionList from './ElectionList';
import VoteTracking from './VoteTracking';
import Notifications from './Notifications';
import UserGuide from './UserGuide';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'elections' | 'tracking' | 'notifications' | 'guide'>('elections');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('voter_profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    setProfile(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Vote className="w-8 h-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-800">SecureVote</span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center text-gray-700">
                <User className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">{profile?.full_name || user?.email}</span>
              </div>
              <button
                onClick={() => signOut()}
                className="flex items-center text-gray-600 hover:text-gray-800 transition"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {!profile?.is_verified && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
          <div className="max-w-7xl mx-auto">
            <p className="text-yellow-800 text-sm text-center">
              Your profile is pending verification. You'll be able to vote once approved by administrators.
            </p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Voting Dashboard</h1>
          <p className="text-gray-600">Access elections, track your votes, and manage notifications</p>
        </div>

        <div className="flex space-x-1 mb-8 border-b">
          <button
            onClick={() => setActiveTab('elections')}
            className={`px-6 py-3 font-medium transition border-b-2 ${
              activeTab === 'elections'
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-600 border-transparent hover:text-gray-800'
            }`}
          >
            <Calendar className="w-5 h-5 inline mr-2" />
            Elections
          </button>
          <button
            onClick={() => setActiveTab('tracking')}
            className={`px-6 py-3 font-medium transition border-b-2 ${
              activeTab === 'tracking'
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-600 border-transparent hover:text-gray-800'
            }`}
          >
            <Vote className="w-5 h-5 inline mr-2" />
            Vote Tracking
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-6 py-3 font-medium transition border-b-2 ${
              activeTab === 'notifications'
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-600 border-transparent hover:text-gray-800'
            }`}
          >
            <Bell className="w-5 h-5 inline mr-2" />
            Notifications
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-6 py-3 font-medium transition border-b-2 ${
              activeTab === 'guide'
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-600 border-transparent hover:text-gray-800'
            }`}
          >
            User Guide
          </button>
        </div>

        <div>
          {activeTab === 'elections' && <ElectionList isVerified={profile?.is_verified || false} />}
          {activeTab === 'tracking' && <VoteTracking />}
          {activeTab === 'notifications' && <Notifications />}
          {activeTab === 'guide' && <UserGuide />}
        </div>
      </div>
    </div>
  );
}
