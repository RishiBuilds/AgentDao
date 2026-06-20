'use client';

import { useState, useEffect } from 'react';
import {
  Zap,
  ExternalLink,
  Globe,
  Box,
  Activity,
} from 'lucide-react';
import TreasuryPanel from './components/TreasuryPanel';
import AgentsPanel from './components/AgentsPanel';
import ProposalsPanel from './components/ProposalsPanel';
import TriggerPanel from './components/TriggerPanel';
import { apiUrl, config, explorerAddressUrl } from '@/lib/config';

export default function Dashboard() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [blockNumber, setBlockNumber] = useState<string | null>(null);
  const [networkStatus, setNetworkStatus] = useState<'connected' | 'error'>('error');

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch block number
  useEffect(() => {
    const fetchBlock = async () => {
      try {
        const res = await fetch(apiUrl('/api/block'));
        const data = await res.json();
        if (data.success) {
          setBlockNumber(data.data.blockNumber);
          setNetworkStatus('connected');
        }
      } catch {
        setNetworkStatus('error');
      }
    };
    fetchBlock();
    const interval = setInterval(fetchBlock, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleTriggerComplete = () => {
    setRefreshKey(prev => prev + 1);
  };

  const contractLinks = [
    { name: 'AgentIdentity', address: config.contracts.AgentIdentity },
    { name: 'AgentTreasury', address: config.contracts.AgentTreasury },
    { name: 'AgentGovernor', address: config.contracts.AgentGovernor },
  ];

  return (
    <main className="min-h-screen animated-gradient-bg text-white">
      {/* ─── Header ─── */}
      <header className="border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="icon-container-lg icon-glow-violet">
              <Activity size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight gradient-text">
                AgentDAO
              </h1>
              <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                Autonomous AI Governance on Monad
              </p>
            </div>
          </div>

          {/* Network Status */}
          <div className="flex items-center gap-3">
            <div className="stat-card">
              <Globe size={14} className="text-[var(--text-tertiary)]" />
              <span className="text-xs font-medium text-[var(--text-secondary)]">
                Monad Testnet
              </span>
              <span
                className={`status-dot ${
                  networkStatus === 'connected'
                    ? 'status-dot-live'
                    : 'status-dot-inactive'
                }`}
              />
            </div>
            {blockNumber && (
              <div className="stat-card">
                <Box size={14} className="text-[var(--text-tertiary)]" />
                <span className="text-xs font-mono text-[var(--text-secondary)]">
                  #{parseInt(blockNumber).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Treasury & Agents Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
              <TreasuryPanel refreshKey={refreshKey} />
              <AgentsPanel refreshKey={refreshKey} />
            </div>

            {/* Proposals */}
            <div className="animate-fade-in-up animate-delay-200">
              <ProposalsPanel refreshKey={refreshKey} />
            </div>
          </div>

          {/* Right Column - Trigger */}
          <div className="lg:col-span-1 animate-fade-in-up animate-delay-300">
            <TriggerPanel onComplete={handleTriggerComplete} />
          </div>
        </div>

        {/* ─── Footer ─── */}
        <footer className="mt-12 pt-6 border-t border-white/[0.06]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <Zap size={12} />
              <span>Contracts deployed on Monad Testnet</span>
            </div>

            <div className="flex items-center gap-3 flex-wrap justify-center">
              {contractLinks.map((c) => (
                <a
                  key={c.name}
                  href={explorerAddressUrl(c.address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)] hover:text-[var(--accent-violet)] transition-colors"
                >
                  <span>{c.name}</span>
                  <ExternalLink size={10} />
                </a>
              ))}
            </div>
          </div>

          <p className="text-center text-[10px] text-[var(--text-muted)] mt-4 pb-4">
            An AI company running itself — Powered by autonomous agents
          </p>
        </footer>
      </div>
    </main>
  );
}
