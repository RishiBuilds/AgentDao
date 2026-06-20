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
    <div className="nb-card-elevated p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--nb-foreground)]">
          Proposals
        </h2>
        <GlowIcon icon={FileText} glowClass="nb-icon-violet" size={18} />
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="h-24 bg-[var(--nb-bg)] rounded-lg border-2 border-[var(--nb-border)] animate-pulse" />
          <div className="h-24 bg-[var(--nb-bg)] rounded-lg border-2 border-[var(--nb-border)] animate-pulse" />
          <div className="h-24 bg-[var(--nb-bg)] rounded-lg border-2 border-[var(--nb-border)] animate-pulse" />
        </div>
      ) : proposals.length === 0 ? (
        <div className="text-center py-12">
          <div className="nb-icon-container nb-icon-violet mx-auto mb-3">
            <Bot size={20} />
          </div>
          <p className="text-sm font-bold text-[var(--nb-foreground)]">
            No proposals yet
          </p>
          <p className="text-xs font-semibold text-[var(--nb-text-muted)] mt-1">
            Trigger an autonomous run to create proposals
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
          {proposals.map((proposal) => (
            <div
              key={proposal.id}
              className="p-4 rounded-lg bg-[var(--nb-bg-secondary)] border-2 border-[var(--nb-border)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none cursor-pointer transition-all duration-150"
              style={{ boxShadow: '3px 3px 0px 0px #1a1a2e' }}
              onClick={() => setSelectedProposal(proposal)}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <StatusIcon state={proposal.state} size={16} />
                  <span className="text-sm font-bold text-[var(--nb-foreground)]">
                    Proposal #{proposal.id}
                  </span>
                </div>
                <span className={getStateBadgeClass(proposal.state)}>
                  <StatusIcon state={proposal.state} size={10} />
                  {proposal.state}
                </span>
              </div>

              <p className="text-xs font-medium text-[var(--nb-text-muted)] line-clamp-2 mb-3 leading-relaxed">
                {proposal.description}
              </p>

              <div className="nb-vote-bar mb-2.5">
                <div
                  className="nb-vote-bar-for"
                  style={{ width: `${getVotePercent(proposal)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <VoteForIcon size={12} />
                    <span className="font-bold text-[var(--nb-foreground)]">
                      {proposal.forVotes}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <VoteAgainstIcon size={12} />
                    <span className="font-bold text-[var(--nb-foreground)]">
                      {proposal.againstVotes}
                    </span>
                  </div>
                </div>
                <div
                  className="flex items-center gap-1.5 px-2 py-0.5 rounded border-2 border-[var(--nb-border)] bg-[var(--nb-amber-bg)] font-bold text-amber-800"
                  style={{ boxShadow: '1px 1px 0px 0px #1a1a2e' }}
                >
                  <Coins size={11} />
                  <span className="font-mono">{formatMON(proposal.value)} MON</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedProposal && (
        <div
          className="nb-modal-overlay"
          onClick={() => setSelectedProposal(null)}
        >
          <div
            className="nb-modal-content p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="nb-icon-container nb-icon-violet">
                  <FileText size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-[var(--nb-foreground)]">
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
                <p className="text-sm text-[var(--nb-foreground)] bg-[var(--nb-bg-secondary)] rounded-lg p-4 leading-relaxed border-2 border-[var(--nb-border)] font-medium"
                   style={{ boxShadow: '2px 2px 0px 0px #1a1a2e' }}
                >
                  {selectedProposal.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div
                  className="p-4 rounded-lg bg-[var(--nb-amber-bg)] border-2 border-[var(--nb-border)] flex flex-col items-start gap-1"
                  style={{ boxShadow: '2px 2px 0px 0px #1a1a2e' }}
                >
                  <div className="flex items-center gap-1.5">
                    <Coins size={12} className="text-amber-700" />
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest">
                      Amount
                    </span>
                  </div>
                  <span className="text-lg font-extrabold text-[var(--nb-foreground)]">
                    {formatMON(selectedProposal.value)} MON
                  </span>
                </div>
                <div
                  className="p-4 rounded-lg bg-[var(--nb-blue-bg)] border-2 border-[var(--nb-border)] flex flex-col items-start gap-1"
                  style={{ boxShadow: '2px 2px 0px 0px #1a1a2e' }}
                >
                  <div className="flex items-center gap-1.5">
                    <Hash size={12} className="text-blue-700" />
                    <span className="text-[10px] font-bold text-blue-800 uppercase tracking-widest">
                      Executed
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {selectedProposal.executed ? (
                      <CheckCircle2 size={16} className="text-emerald-600" />
                    ) : (
                      <XCircle size={16} className="text-rose-600" />
                    )}
                    <span className="text-lg font-extrabold text-[var(--nb-foreground)]">
                      {selectedProposal.executed ? 'Yes' : 'No'}
                    </span>
                  </div>
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
                      <VoteForIcon size={14} />
                      <span className="text-xs text-emerald-700 font-bold uppercase">For</span>
                    </div>
                    <div className="text-2xl font-extrabold text-[var(--nb-foreground)]">
                      {selectedProposal.forVotes}
                    </div>
                  </div>
                  <div
                    className="p-4 rounded-lg bg-[var(--nb-rose-bg)] border-2 border-[var(--nb-border)]"
                    style={{ boxShadow: '2px 2px 0px 0px #1a1a2e' }}
                  >
                    <div className="flex items-center gap-1.5 mb-2">
                      <VoteAgainstIcon size={14} />
                      <span className="text-xs text-rose-700 font-bold uppercase">Against</span>
                    </div>
                    <div className="text-2xl font-extrabold text-[var(--nb-foreground)]">
                      {selectedProposal.againstVotes}
                    </div>
                  </div>
                </div>

                <div className="nb-vote-bar mt-3">
                  <div
                    className="nb-vote-bar-for"
                    style={{ width: `${getVotePercent(selectedProposal)}%` }}
                  />
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
                  <User size={14} className="text-[var(--nb-text-muted)]" />
                  <span className="text-xs font-mono font-bold text-[var(--nb-foreground)] break-all">
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
