import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { sendPartnerRequest, getPartnerConnections, PartnerConnection } from '../services/partner';
import { Users, Mail, Check, Clock } from 'lucide-react';

const Partner = () => {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [connections, setConnections] = useState<PartnerConnection[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchConnections = async () => {
    if (user) {
      const data = await getPartnerConnections(user.uid);
      setConnections(data);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, [user]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !user) return;

    setLoading(true);
    try {
      await sendPartnerRequest(user.uid, email);
      setMessage('Invitation sent successfully!');
      setEmail('');
      fetchConnections();
    } catch (error) {
      console.error("Error sending invite:", error);
      setMessage('Failed to send invitation. It might already exist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-serif font-bold text-slate-900">Partner</h1>
        <p className="text-slate-600 mt-1">Share your journey with a trusted person.</p>
      </header>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h2 className="text-lg font-serif font-bold text-slate-900 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-indigo-600" />
          Invite a Partner
        </h2>
        <p className="text-sm text-slate-600 mb-6">
          Invite someone to view your mood summaries or selected journal entries. You can revoke access at any time.
        </p>

        <form onSubmit={handleInvite} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Partner's Email</label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="friend@example.com"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Invite'}
              </button>
            </div>
          </div>
          {message && (
            <p className={`text-sm ${message.includes('Failed') ? 'text-red-500' : 'text-green-500'}`}>
              {message}
            </p>
          )}
        </form>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-serif font-bold text-slate-900">Your Connections</h3>
        {connections.length === 0 ? (
          <p className="text-slate-500 italic text-sm">No connections yet.</p>
        ) : (
          connections.map((conn) => (
            <div key={conn.id} className="bg-white p-4 rounded-xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mr-3">
                  <Users className="w-5 h-5 text-slate-500" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">{conn.partnerEmail}</p>
                  <p className="text-xs text-slate-500 capitalize">{conn.permissionLevel.replace('_', ' ')}</p>
                </div>
              </div>
              <div className="flex items-center">
                {conn.status === 'pending' ? (
                  <span className="flex items-center text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded-lg">
                    <Clock className="w-3 h-3 mr-1" /> Pending
                  </span>
                ) : (
                  <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                    <Check className="w-3 h-3 mr-1" /> Active
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Partner;
