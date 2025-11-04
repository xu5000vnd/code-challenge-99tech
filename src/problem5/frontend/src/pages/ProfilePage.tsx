import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { authAPI } from '../services/api';
import type { Session } from '../types';

export default function ProfilePage() {
  const { user, logout, logoutAll } = useAuthStore();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setIsLoadingSessions(true);
      const response = await authAPI.getSessions();
      setSessions(response.data.sessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const handleLogoutAll = async () => {
    if (confirm('Are you sure you want to logout from all devices?')) {
      await logoutAll();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Information */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
          <button
            onClick={logout}
            className="btn-secondary"
          >
            Logout
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                User ID
              </label>
              <p className="text-gray-900 font-mono text-sm">{user.id}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Email
              </label>
              <p className="text-gray-900">{user.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Name
              </label>
              <p className="text-gray-900">{user.name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Member Since
              </label>
              <p className="text-gray-900">{formatDate(user.createdAt)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Active Sessions</h2>
          <button
            onClick={handleLogoutAll}
            className="text-red-600 hover:text-red-700 text-sm font-medium"
          >
            Logout All Devices
          </button>
        </div>

        {isLoadingSessions ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : sessions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No active sessions</p>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium text-gray-900">Device Session</span>
                    </div>
                    
                    {session.deviceInfo && (
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Device:</span> {session.deviceInfo}
                      </p>
                    )}
                    
                    {session.ipAddress && (
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">IP:</span> {session.ipAddress}
                      </p>
                    )}
                    
                    <p className="text-xs text-gray-500 mt-2">
                      Created: {formatDate(session.createdAt)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Expires: {formatDate(session.expiresAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Account Statistics */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-600 font-medium mb-1">Active Sessions</p>
            <p className="text-3xl font-bold text-blue-900">{sessions.length}</p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-green-600 font-medium mb-1">Account Status</p>
            <p className="text-3xl font-bold text-green-900">Active</p>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-purple-600 font-medium mb-1">Last Updated</p>
            <p className="text-sm font-medium text-purple-900">{formatDate(user.updatedAt)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

