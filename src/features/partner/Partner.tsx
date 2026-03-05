import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { sendPartnerRequest, getPartnerConnections, PartnerConnection } from './partnerService';
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
    <div className="max-w-2xl mx-auto space-y-8 pb-10">
      <header>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-[var(--color-text-primary)]">Partner</h1>
        <p className="text-[var(--color-text-secondary)] mt-1.5 text-lg">Share your journey with a trusted person.</p>
      </header>

      <div className="glass rounded-[2rem] p-6 md:p-8 soft-shadow border-none relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--color-pastel-purple)]/10 rounded-full blur-3xl -mt-10 -mr-10 pointer-events-none"></div>
        <h2 className="text-xl font-serif font-bold text-[var(--color-text-primary)] mb-4 flex items-center relative z-10">
          <div className="w-10 h-10 rounded-full bg-[var(--color-pastel-purple)]/20 flex items-center justify-center mr-3">
            <Users className="w-5 h-5 text-[var(--color-pastel-purple)]" />
          </div>
          Invite a Partner
        </h2>
        <p className="text-sm md:text-base text-[var(--color-text-secondary)] mb-6 relative z-10 leading-relaxed">
          Invite someone to view your mood summaries or selected journal entries. You can revoke access at any time.
        </p>

        <form onSubmit={handleInvite} className="space-y-5 relative z-10">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2 ml-1">Partner's Email</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 glow-focus rounded-full transition-shadow duration-300">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--color-text-secondary)] w-5 h-5 opacity-70" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)]/40 focus:outline-none text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/50"
                  placeholder="friend@example.com"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-4 bg-gradient-to-r from-[var(--color-pastel-purple)] to-[var(--color-pastel-blue)] text-white rounded-full font-medium transition-all duration-300 soft-shadow hover:shadow-[0_8px_25px_-8px_rgba(200,182,255,0.6)] hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 min-w-[120px]"
              >
                {loading ? 'Sending...' : 'Invite ✨'}
              </button>
            </div>
          </div>
          {message && (
            <p className={`text-sm font-medium px-4 py-2 rounded-xl inline-block ${message.includes('Failed') ? 'bg-[var(--color-danger)]/10 text-[var(--color-danger)]' : 'bg-[var(--color-pastel-teal)]/10 text-teal-600'}`}>
              {message}
            </p>
          )}
        </form>
      </div>

      <div className="space-y-5">
        <h3 className="text-xl font-serif font-bold text-[var(--color-text-primary)] pl-2">Your Connections</h3>
        {connections.length === 0 ? (
          <div className="glass bg-[var(--color-bg-primary)]/40 border-dashed border-2 border-[var(--color-border-subtle)] rounded-[2rem] p-8 text-center">
            <p className="text-[var(--color-text-secondary)] italic">No connections yet.</p>
          </div>
        ) : (
          connections.map((conn) => (
            <div key={conn.id} className="glass rounded-[1.5rem] p-5 border border-[var(--color-border-subtle)]/50 flex flex-col sm:flex-row items-center justify-between gap-4 hover:shadow-md transition-shadow">
              <div className="flex items-center w-full sm:w-auto">
                <div className="w-12 h-12 bg-[var(--color-pastel-peach)]/20 rounded-full flex items-center justify-center mr-4 shrink-0">
                  <Users className="w-6 h-6 text-[#E5B887]" />
                </div>
                <div>
                  <p className="font-bold text-[var(--color-text-primary)]">{conn.partnerEmail}</p>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 capitalize">{conn.permissionLevel.replace('_', ' ')}</p>
                </div>
              </div>
              <div className="flex items-center shrink-0 w-full sm:w-auto justify-end">
                {conn.status === 'pending' ? (
                  <span className="flex items-center text-xs font-bold text-[#E5B887] bg-amber-50 px-3 py-1.5 rounded-full">
                    <Clock className="w-3.5 h-3.5 mr-1.5" /> Pending
                  </span>
                ) : (
                  <span className="flex items-center text-xs font-bold text-[var(--color-pastel-teal)] bg-teal-50 px-3 py-1.5 rounded-full">
                    <Check className="w-3.5 h-3.5 mr-1.5" /> Active
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
