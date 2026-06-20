'use client';

import { useState, useEffect, useCallback } from 'react';
import { Cpu, Users, RefreshCw, AlertCircle, Megaphone, Coins, Bot } from 'lucide-react';
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

function getRoleIcon(role: string) {
  const r = role.toLowerCase();
  if (r.includes('marketing')) return <Megaphone size={15} />;
  if (r.includes('finance')) return <Coins size={15} />;
  return <Bot size={15} />;
}

function getRoleColors(role: string): { avatar: string; pill: string } {
  const r = role.toLowerCase();
  if (r.includes('marketing'))
    return {
      avatar: 'bg-violet-100 text-violet-700',
      pill: 'bg-violet-100 text-violet-700',
    };
  if (r.includes('finance'))
    return {
      avatar: 'bg-emerald-100 text-emerald-700',
      pill: 'bg-emerald-100 text-emerald-700',
    };
  return {
    avatar: 'bg-[var(--nb-bg)] text-[var(--nb-text-muted)] border-2 border-[var(--nb-border)]',
    pill: 'bg-[var(--nb-bg)] text-[var(--nb-text-muted)]',
  };
}

function truncateAddress(addr: string) {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function formatLastUpdated(date: Date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function SkeletonRow() {
  return (
    <div className="h-[54px] rounded-lg bg-[var(--nb-bg)] border-2 border-[var(--nb-border)] animate-pulse" />
  );
}

function EmptyState() {
  return (
    <div className="text-center py-10">
      <div className="w-10 h-10 rounded-lg bg-[var(--nb-bg)] border-2 border-[var(--nb-border)] flex items-center justify-center mx-auto mb-3 text-[var(--nb-text-muted)]">
        <Users size={18} />
      </div>
      <p className="text-sm font-bold text-[var(--nb-text-muted)]">No agents registered</p>
      <p className="text-xs text-[var(--nb-text-muted)] mt-1">
        Mint an agent identity to get started
      </p>
    </div>
  );
}

function ErrorBar({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border-2 border-red-200 text-red-700">
      <AlertCircle size={15} className="shrink-0" />
      <p className="text-xs font-semibold flex-1">{message}</p>
      <button
        onClick={onRetry}
        className="text-xs font-bold underline underline-offset-2 hover:opacity-70"
      >
        Retry
      </button>
    </div>
  );
}

function AgentRow({ agent }: { agent: Agent }) {
  const colors = getRoleColors(agent.role);

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-lg bg-white border-2 border-[var(--nb-border)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-150"
      style={{ boxShadow: '2px 2px 0px 0px #1a1a2e' }}
      title={`Owner: ${agent.owner}`}
      role="listitem"
    >
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colors.avatar}`}
        aria-hidden="true"
      >
        {getRoleIcon(agent.role)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-[var(--nb-foreground)] truncate">
          {agent.name}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${colors.pill}`}>
            {agent.role}
          </span>
          <span className="text-[10px] font-mono text-[var(--nb-text-muted)]">
            #{agent.tokenId}
          </span>
          <span className="text-[10px] font-mono text-[var(--nb-text-muted)] hidden sm:inline">
            {truncateAddress(agent.owner)}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            agent.isActive ? 'bg-emerald-500 ring-2 ring-emerald-500/20' : 'bg-gray-300'
          }`}
        />
        <span
          className={`text-[10px] font-bold uppercase tracking-wider ${
            agent.isActive ? 'text-emerald-700' : 'text-[var(--nb-text-muted)]'
          }`}
        >
          {agent.isActive ? 'Online' : 'Offline'}
        </span>
      </div>
    </div>
  );
}

export default function AgentsPanel({ refreshKey }: AgentsPanelProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAgents = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await fetch(apiUrl('/api/agents'));

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();

      if (data?.success && Array.isArray(data.data)) {
        setAgents(data.data);
        setLastUpdated(new Date());
      } else {
        throw new Error('Unexpected response shape');
      }
    } catch (err) {
      console.error('Failed to fetch agents:', err);
      setError('Could not load agents. Check that the backend is running.');
      if (!isManual) setAgents([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [refreshKey, fetchAgents]);

  const activeCount = agents.filter((a) => a.isActive).length;

  return (
    <div className="nb-card p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Cpu size={16} className="text-[var(--nb-text-muted)]" aria-hidden="true" />
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-[var(--nb-text-muted)]">
            Active Agents
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {!loading && !error && agents.length > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--nb-bg)] border-2 border-[var(--nb-border)] text-[var(--nb-text-muted)]">
              {activeCount}/{agents.length} online
            </span>
          )}

          {lastUpdated && (
            <span className="text-[10px] text-[var(--nb-text-muted)] hidden sm:inline">
              {formatLastUpdated(lastUpdated)}
            </span>
          )}

          <button
            onClick={() => fetchAgents(true)}
            disabled={loading || isRefreshing}
            className="p-1 rounded text-[var(--nb-text-muted)] hover:text-[var(--nb-foreground)] disabled:opacity-40 transition-colors"
            aria-label="Refresh agents"
          >
            <RefreshCw
              size={14}
              className={isRefreshing ? 'animate-spin' : ''}
            />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2.5">
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      ) : (
        <div className="space-y-2.5">
          {error && <ErrorBar message={error} onRetry={() => fetchAgents(true)} />}

          {!error && agents.length === 0 ? (
            <EmptyState />
          ) : (
            <div role="list" className="space-y-2.5">
              {agents.map((agent) => (
                <AgentRow key={agent.tokenId} agent={agent} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}