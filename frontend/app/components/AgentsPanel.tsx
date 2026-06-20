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
      if (data && data.success && Array.isArray(data.data)) {
        setAgents(data.data);
      } else {
        setAgents([]);
      }
    } catch (error) {
      console.error('Failed to fetch agents:', error);
      setAgents([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nb-card p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--nb-foreground)]">
          Active Agents
        </h2>
        <GlowIcon icon={Cpu} glowClass="nb-icon-cyan" size={18} />
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="h-14 bg-[var(--nb-bg)] rounded-md border-2 border-[var(--nb-border)] animate-pulse" />
          <div className="h-14 bg-[var(--nb-bg)] rounded-md border-2 border-[var(--nb-border)] animate-pulse" />
        </div>
      ) : (
        <div className="space-y-2.5">
          {agents.map((agent) => (
            <div
              key={agent.tokenId}
              className="flex items-center gap-3 p-3 rounded-lg bg-white border-2 border-[var(--nb-border)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-150"
              style={{ boxShadow: '2px 2px 0px 0px #1a1a2e' }}
            >
              <RoleIcon role={agent.role} size={16} />

              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-[var(--nb-foreground)] truncate">
                  {agent.name}
                </div>
                <div className="text-xs font-semibold text-[var(--nb-text-muted)]">
                  {agent.role}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`nb-status-dot ${
                    agent.isActive ? 'nb-status-dot-active' : 'nb-status-dot-inactive'
                  }`}
                />
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    agent.isActive
                      ? 'text-emerald-700'
                      : 'text-[var(--nb-text-muted)]'
                  }`}
                >
                  {agent.isActive ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          ))}

          {agents.length === 0 && (
            <div className="text-center py-8">
              <div className="nb-icon-container nb-icon-cyan mx-auto mb-3">
                <Users size={18} />
              </div>
              <p className="text-sm font-bold text-[var(--nb-text-muted)]">
                No agents registered
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
