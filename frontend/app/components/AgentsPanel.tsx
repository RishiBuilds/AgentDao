'use client';

import { useState, useEffect } from 'react';
import { Cpu, Users } from 'lucide-react';
import { RoleIcon, GlowIcon } from './Icons';
import { apiUrl } from '@/lib/config';

interface Agent {
  tokenId: string;
  owner: string;
  name: string;
  role: string;
  isActive: boolean;
}

interface AgentsPanelProps {
  refreshKey: number;
}

export default function AgentsPanel({ refreshKey }: AgentsPanelProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgents();
  }, [refreshKey]);

  const fetchAgents = async () => {
    try {
      const res = await fetch(apiUrl('/api/agents'));
      const data = await res.json();
      setAgents(data.data);
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
          Active Agents
        </h2>
        <GlowIcon icon={Cpu} glowClass="icon-glow-cyan" size={18} />
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-14 bg-white/[0.04] rounded-lg" />
          <div className="h-14 bg-white/[0.04] rounded-lg" />
        </div>
      ) : (
        <div className="space-y-2.5">
          {agents.map((agent) => (
            <div
              key={agent.tokenId}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.04] transition-all duration-200"
            >
              <RoleIcon role={agent.role} size={16} />

              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[var(--text-primary)] truncate">
                  {agent.name}
                </div>
                <div className="text-xs text-[var(--text-tertiary)]">
                  {agent.role}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`status-dot ${
                    agent.isActive ? 'status-dot-active' : 'status-dot-inactive'
                  }`}
                />
                <span
                  className={`text-[10px] font-medium uppercase tracking-wider ${
                    agent.isActive
                      ? 'text-[var(--accent-emerald)]'
                      : 'text-[var(--text-muted)]'
                  }`}
                >
                  {agent.isActive ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          ))}

          {agents.length === 0 && (
            <div className="text-center py-8">
              <div className="icon-container icon-glow-cyan mx-auto mb-3">
                <Users size={18} />
              </div>
              <p className="text-sm text-[var(--text-tertiary)]">
                No agents registered
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
