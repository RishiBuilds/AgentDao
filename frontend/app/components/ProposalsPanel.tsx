'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Bot,
  X,
  Coins,
  User,
  CheckCircle2,
  XCircle,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { StatusIcon, StateBadge, GlowIcon, VoteForIcon, VoteAgainstIcon } from './Icons';
import { apiUrl } from '@/lib/config';

interface Proposal {
  id: string;
  proposer: string;
  description: string;
  value: string;
  state: string;
  forVotes: string;
  againstVotes: string;
  executed: boolean;
}

interface ProposalsPanelProps {
  refreshKey: number;
  totalProposals?: number;
}

function formatMON(weiStr: string) {
  return (parseFloat(weiStr) / 1e18).toFixed(4);
}

function getVotePercent(proposal: Proposal) {
  const forV = parseInt(proposal.forVotes) || 0;
  const againstV = parseInt(proposal.againstVotes) || 0;
  const total = forV + againstV;
  if (total === 0) return 50;
  return Math.round((forV / total) * 100);
}

function truncateAddress(addr: string) {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function SkeletonCard() {
  return (
    <div className="h-24 bg-[var(--nb-bg)] rounded-lg border-2 border-[var(--nb-border)] animate-pulse" />
  );
}

function VoteBar({ percent }: { percent: number }) {
  return (
    <div className="nb-vote-bar my-2.5">
      <div className="nb-vote-bar-for" style={{ width: `${percent}%` }} />
    </div>
  );
}

function ProposalCard({
  proposal,
  onClick,
}: {
  proposal: Proposal;
  onClick: () => void;
}) {
  const percent = getVotePercent(proposal);

  return (
    <button
      className="w-full text-left p-4 rounded-lg bg-[var(--nb-bg-secondary)] border-2 border-[var(--nb-border)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none cursor-pointer transition-all duration-150"
      style={{ boxShadow: '3px 3px 0px 0px #1a1a2e' }}
      onClick={onClick}
      aria-label={`Open proposal #${proposal.id}: ${proposal.description.slice(0, 60)}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <StatusIcon state={proposal.state} size={16} />
          <span className="text-sm font-bold text-[var(--nb-foreground)]">
            Proposal #{proposal.id}
          </span>
        </div>
        <StateBadge state={proposal.state} />
      </div>

      <p className="text-xs font-medium text-[var(--nb-text-muted)] line-clamp-2 mb-1 leading-relaxed">
        {proposal.description}
      </p>

      <VoteBar percent={percent} />

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <VoteForIcon size={12} />
            <span className="font-bold text-[var(--nb-foreground)]">{proposal.forVotes}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <VoteAgainstIcon size={12} />
            <span className="font-bold text-[var(--nb-foreground)]">{proposal.againstVotes}</span>
          </div>
        </div>
        <div
          className="flex items-center gap-1.5 px-2 py-0.5 rounded border-2 border-[var(--nb-border)] bg-[var(--nb-amber-bg)] font-bold text-amber-800"
          style={{ boxShadow: '1px 1px 0px 0px #1a1a2e' }}
        >
          <Coins size={11} aria-hidden="true" />
          <span className="font-mono">{formatMON(proposal.value)} MON</span>
        </div>
      </div>
    </button>
  );
}

function ProposalModal({
  proposal,
  onClose,
}: {
  proposal: Proposal;
  onClose: () => void;
}) {
  const percent = getVotePercent(proposal);

  return (
    <div
      className="nb-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Proposal #${proposal.id} details`}
    >
      <div
        className="nb-modal-content p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <GlowIcon icon={FileText} size={18} glowClass="nb-icon-violet" />
            <div>
              <h3 className="text-lg font-extrabold text-[var(--nb-foreground)]">
                Proposal #{proposal.id}
              </h3>
              <StateBadge state={proposal.state} />
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-md border-2 border-[var(--nb-border)] bg-[var(--nb-rose-bg)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-rose-700 font-bold"
            style={{ boxShadow: '2px 2px 0px 0px #1a1a2e' }}
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="text-xs font-bold text-[var(--nb-text-muted)] uppercase tracking-widest block mb-2">
              Description
            </label>
            <p
              className="text-sm text-[var(--nb-foreground)] bg-[var(--nb-bg-secondary)] rounded-lg p-4 leading-relaxed border-2 border-[var(--nb-border)] font-medium"
              style={{ boxShadow: '2px 2px 0px 0px #1a1a2e' }}
            >
              {proposal.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div
              className="p-4 rounded-lg bg-[var(--nb-amber-bg)] border-2 border-[var(--nb-border)] flex flex-col gap-1"
              style={{ boxShadow: '2px 2px 0px 0px #1a1a2e' }}
            >
              <div className="flex items-center gap-1.5">
                <Coins size={12} className="text-amber-700" aria-hidden="true" />
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest">
                  Amount
                </span>
              </div>
              <span className="text-lg font-extrabold text-[var(--nb-foreground)]">
                {formatMON(proposal.value)} MON
              </span>
            </div>

            <div
              className="p-4 rounded-lg bg-[var(--nb-blue-bg)] border-2 border-[var(--nb-border)] flex flex-col gap-1"
              style={{ boxShadow: '2px 2px 0px 0px #1a1a2e' }}
            >
              <div className="flex items-center gap-1.5">
                {proposal.executed ? (
                  <CheckCircle2 size={12} className="text-blue-700" aria-hidden="true" />
                ) : (
                  <XCircle size={12} className="text-blue-700" aria-hidden="true" />
                )}
                <span className="text-[10px] font-bold text-blue-800 uppercase tracking-widest">
                  Executed
                </span>
              </div>
              <span className="text-lg font-extrabold text-[var(--nb-foreground)]">
                {proposal.executed ? 'Yes' : 'No'}
              </span>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--nb-text-muted)] uppercase tracking-widest block mb-3">
              Votes
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div
                className="p-4 rounded-lg bg-[var(--nb-emerald-bg)] border-2 border-[var(--nb-border)]"
                style={{ boxShadow: '2px 2px 0px 0px #1a1a2e' }}
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <VoteForIcon size={14} showLabel />
                </div>
                <div className="text-2xl font-extrabold text-[var(--nb-foreground)]">
                  {proposal.forVotes}
                </div>
              </div>
              <div
                className="p-4 rounded-lg bg-[var(--nb-rose-bg)] border-2 border-[var(--nb-border)]"
                style={{ boxShadow: '2px 2px 0px 0px #1a1a2e' }}
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <VoteAgainstIcon size={14} showLabel />
                </div>
                <div className="text-2xl font-extrabold text-[var(--nb-foreground)]">
                  {proposal.againstVotes}
                </div>
              </div>
            </div>
            <VoteBar percent={percent} />
            <div className="flex justify-between text-[10px] font-bold text-[var(--nb-text-muted)] mt-1">
              <span>{percent}% for</span>
              <span>{100 - percent}% against</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--nb-text-muted)] uppercase tracking-widest block mb-2">
              Proposer
            </label>
            <div
              className="flex items-center gap-2 p-3 rounded-lg bg-[var(--nb-bg-secondary)] border-2 border-[var(--nb-border)]"
              style={{ boxShadow: '2px 2px 0px 0px #1a1a2e' }}
            >
              <User size={14} className="text-[var(--nb-text-muted)] shrink-0" aria-hidden="true" />
              <span
                className="text-xs font-mono font-bold text-[var(--nb-foreground)] break-all"
                title={proposal.proposer}
              >
                {proposal.proposer}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProposalsPanel({
  refreshKey,
  totalProposals = 10,
}: ProposalsPanelProps) {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);

  const fetchProposals = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const results = await Promise.all(
        Array.from({ length: totalProposals }, (_, i) =>
          fetch(apiUrl(`/api/proposals/${i}`))
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => data?.data ?? null)
            .catch(() => null)
        )
      );

      const valid = results.filter(
        (p): p is Proposal => p !== null && p.id !== undefined && p.state !== undefined
      );

      setProposals(valid.reverse());
    } catch {
      setError('Could not load proposals. Check that the backend is running.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [totalProposals]);

  useEffect(() => {
    fetchProposals();
  }, [refreshKey, fetchProposals]);

  return (
    <div className="nb-card-elevated p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--nb-foreground)]">
            Proposals
          </h2>
          {!loading && proposals.length > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--nb-bg)] border-2 border-[var(--nb-border)] text-[var(--nb-text-muted)]">
              {proposals.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchProposals(true)}
            disabled={loading || isRefreshing}
            className="p-1 rounded text-[var(--nb-text-muted)] hover:text-[var(--nb-foreground)] disabled:opacity-40 transition-colors"
            aria-label="Refresh proposals"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
          <GlowIcon icon={FileText} glowClass="nb-icon-violet" size={18} />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border-2 border-red-200 text-red-700">
          <AlertCircle size={15} className="shrink-0" />
          <p className="text-xs font-semibold flex-1">{error}</p>
          <button
            onClick={() => fetchProposals(true)}
            className="text-xs font-bold underline underline-offset-2 hover:opacity-70"
          >
            Retry
          </button>
        </div>
      ) : proposals.length === 0 ? (
        <div className="text-center py-12">
          <div className="nb-icon-container nb-icon-violet mx-auto mb-3">
            <Bot size={20} />
          </div>
          <p className="text-sm font-bold text-[var(--nb-foreground)]">No proposals yet</p>
          <p className="text-xs font-semibold text-[var(--nb-text-muted)] mt-1">
            Trigger an autonomous run to create proposals
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
          {proposals.map((proposal) => (
            <ProposalCard
              key={proposal.id}
              proposal={proposal}
              onClick={() => setSelectedProposal(proposal)}
            />
          ))}
        </div>
      )}

      {selectedProposal && (
        <ProposalModal
          proposal={selectedProposal}
          onClose={() => setSelectedProposal(null)}
        />
      )}
    </div>
  );
}