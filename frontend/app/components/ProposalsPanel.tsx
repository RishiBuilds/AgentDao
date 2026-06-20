'use client';

import { useState, useEffect } from 'react';
import {
  FileText,
  Bot,
  X,
  Coins,
  Hash,
  User,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import {
  StatusIcon,
  GlowIcon,
  VoteForIcon,
  VoteAgainstIcon,
  getStateBadgeClass,
} from './Icons';
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
}

export default function ProposalsPanel({ refreshKey }: ProposalsPanelProps) {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);

  useEffect(() => {
    fetchProposals();
  }, [refreshKey]);

  const fetchProposals = async () => {
    try {
      const proposalPromises = [];
      for (let i = 0; i < 10; i++) {
        proposalPromises.push(
          fetch(apiUrl(`/api/proposals/${i}`))
            .then(res => {
              if (!res.ok) return null;
              return res.json();
            })
            .then(data => data?.data || null)
            .catch(() => null)
        );
      }

      const results = await Promise.all(proposalPromises);
      const validProposals = results.filter(
        p => p !== null && p.id !== undefined && p.state !== undefined
      );
      setProposals(validProposals.reverse());
    } catch (error) {
      console.error('Failed to fetch proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  const getVotePercent = (proposal: Proposal) => {
    const forV = parseInt(proposal.forVotes) || 0;
    const againstV = parseInt(proposal.againstVotes) || 0;
    const total = forV + againstV;
    if (total === 0) return 50;
    return Math.round((forV / total) * 100);
  };

  const formatMON = (weiStr: string) => {
    return (parseFloat(weiStr) / 1e18).toFixed(4);
  };

  return (
    <div className="glass-card-elevated p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
          Proposals
        </h2>
        <GlowIcon icon={FileText} glowClass="icon-glow-violet" size={18} />
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-24 bg-white/[0.04] rounded-xl" />
          <div className="h-24 bg-white/[0.04] rounded-xl" />
          <div className="h-24 bg-white/[0.04] rounded-xl" />
        </div>
      ) : proposals.length === 0 ? (
        <div className="text-center py-12">
          <div className="icon-container icon-glow-violet mx-auto mb-3">
            <Bot size={20} />
          </div>
          <p className="text-sm text-[var(--text-secondary)] font-medium">
            No proposals yet
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Trigger an autonomous run to create proposals
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
          {proposals.map((proposal) => (
            <div
              key={proposal.id}
              className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.1] hover:bg-white/[0.04] cursor-pointer transition-all duration-200"
              onClick={() => setSelectedProposal(proposal)}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <StatusIcon state={proposal.state} size={16} />
                  <span className="text-sm font-semibold text-[var(--text-primary)]">
                    Proposal #{proposal.id}
                  </span>
                </div>
                <span className={getStateBadgeClass(proposal.state)}>
                  <StatusIcon state={proposal.state} size={10} />
                  {proposal.state}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mb-3 leading-relaxed">
                {proposal.description}
              </p>

              {/* Vote Bar */}
              <div className="vote-bar mb-2.5">
                <div
                  className="vote-bar-for"
                  style={{ width: `${getVotePercent(proposal)}%` }}
                />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <VoteForIcon size={12} />
                    <span className="text-[var(--text-secondary)] font-medium">
                      {proposal.forVotes}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <VoteAgainstIcon size={12} />
                    <span className="text-[var(--text-secondary)] font-medium">
                      {proposal.againstVotes}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[var(--text-tertiary)]">
                  <Coins size={11} />
                  <span className="font-mono">{formatMON(proposal.value)} MON</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Detail Modal ─── */}
      {selectedProposal && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedProposal(null)}
        >
          <div
            className="modal-content p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="icon-container icon-glow-violet">
                  <FileText size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">
                    Proposal #{selectedProposal.id}
                  </h3>
                  <span className={getStateBadgeClass(selectedProposal.state)}>
                    <StatusIcon state={selectedProposal.state} size={10} />
                    {selectedProposal.state}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedProposal(null)}
                className="p-2 rounded-lg hover:bg-white/[0.06] transition-colors text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5">
              {/* Description */}
              <div>
                <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                  Description
                </label>
                <p className="text-sm text-[var(--text-secondary)] bg-white/[0.03] rounded-xl p-4 leading-relaxed border border-white/[0.04]">
                  {selectedProposal.description}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="stat-card flex-col items-start gap-1">
                  <div className="flex items-center gap-1.5">
                    <Coins size={12} className="text-[var(--text-muted)]" />
                    <span className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider">
                      Amount
                    </span>
                  </div>
                  <span className="text-lg font-bold text-[var(--text-primary)]">
                    {formatMON(selectedProposal.value)} MON
                  </span>
                </div>
                <div className="stat-card flex-col items-start gap-1">
                  <div className="flex items-center gap-1.5">
                    <Hash size={12} className="text-[var(--text-muted)]" />
                    <span className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider">
                      Executed
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {selectedProposal.executed ? (
                      <CheckCircle2 size={16} className="text-[var(--accent-emerald)]" />
                    ) : (
                      <XCircle size={16} className="text-[var(--text-muted)]" />
                    )}
                    <span className="text-lg font-bold text-[var(--text-primary)]">
                      {selectedProposal.executed ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Votes */}
              <div>
                <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider block mb-3">
                  Votes
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/[0.12]">
                    <div className="flex items-center gap-1.5 mb-2">
                      <VoteForIcon size={14} />
                      <span className="text-xs text-[var(--accent-emerald)] font-medium">For</span>
                    </div>
                    <div className="text-2xl font-bold text-[var(--text-primary)]">
                      {selectedProposal.forVotes}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-rose-500/[0.06] border border-rose-500/[0.12]">
                    <div className="flex items-center gap-1.5 mb-2">
                      <VoteAgainstIcon size={14} />
                      <span className="text-xs text-[var(--accent-rose)] font-medium">Against</span>
                    </div>
                    <div className="text-2xl font-bold text-[var(--text-primary)]">
                      {selectedProposal.againstVotes}
                    </div>
                  </div>
                </div>

                {/* Vote Bar */}
                <div className="vote-bar mt-3">
                  <div
                    className="vote-bar-for"
                    style={{ width: `${getVotePercent(selectedProposal)}%` }}
                  />
                </div>
              </div>

              {/* Proposer */}
              <div>
                <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                  Proposer
                </label>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                  <User size={14} className="text-[var(--text-muted)]" />
                  <span className="text-xs font-mono text-[var(--text-secondary)] break-all">
                    {selectedProposal.proposer}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
