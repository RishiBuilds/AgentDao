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

type NetworkStatus = 'connecting' | 'connected' | 'error';

interface BlockApiResponse {
  success: boolean;
  data?: { blockNumber: string };
}

const REFRESH_INTERVAL_MS = 5000;
const BLOCK_POLL_INTERVAL_MS = 10000;

const CONTRACT_LINKS = [
  { name: 'AgentIdentity', address: config.contracts.AgentIdentity },
  { name: 'AgentTreasury', address: config.contracts.AgentTreasury },
  { name: 'AgentGovernor', address: config.contracts.AgentGovernor },
];

function parseBlockNumber(value: string): number {
  const radix = value.startsWith('0x') || value.startsWith('0X') ? 16 : 10;
  return Number.parseInt(value, radix);
}

export default function Dashboard() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [blockNumber, setBlockNumber] = useState<string | null>(null);
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>('connecting');

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let requestId = 0;
    let cancelled = false;
    let activeController: AbortController | null = null;

    const fetchBlock = async () => {
      const thisRequestId = ++requestId;
      activeController?.abort();
      const controller = new AbortController();
      activeController = controller;

      try {
        const res = await fetch(apiUrl('/api/block'), { signal: controller.signal });
        if (!res.ok) throw new Error(`Block endpoint returned ${res.status}`);

        const data: BlockApiResponse = await res.json();
        if (cancelled || thisRequestId !== requestId) return;

        if (data && data.success && data.data) {
          setBlockNumber(data.data.blockNumber);
          setNetworkStatus('connected');
        } else {
          setNetworkStatus('error');
        }
      } catch {
        if (controller.signal.aborted) return;
        if (!cancelled && thisRequestId === requestId) {
          setNetworkStatus('error');
        }
      }
    };

    fetchBlock();
    const interval = setInterval(fetchBlock, BLOCK_POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      activeController?.abort();
      clearInterval(interval);
    };
  }, []);

  const handleTriggerComplete = () => {
    setRefreshKey(prev => prev + 1);
  };

  const parsedBlockNumber = blockNumber !== null ? parseBlockNumber(blockNumber) : Number.NaN;

  return (
    <main className="min-h-screen nb-grid-bg">
      <header className="border-b-[3px] border-[var(--nb-border)]">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="nb-icon-container-lg nb-icon-violet flex items-center justify-center"
              style={{ boxShadow: 'var(--nb-shadow-hover)' }}
            >
              <Activity size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-[var(--nb-foreground)]">
                AgentDAO
              </h1>
              <p className="text-xs font-bold text-[var(--nb-text-muted)] mt-0.5 uppercase tracking-wider">
                Autonomous AI Governance on Monad
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="nb-stat-card">
              <Globe size={14} className="text-[var(--nb-text-muted)]" />
              <span className="text-xs font-bold text-[var(--nb-foreground)]">
                Monad Testnet
              </span>
              <span
                className={`nb-status-dot ${
                  networkStatus === 'connected'
                    ? 'nb-status-dot-live'
                    : 'nb-status-dot-inactive'
                }`}
                role="status"
                aria-label={
                  networkStatus === 'connected'
                    ? 'Network connected'
                    : networkStatus === 'connecting'
                    ? 'Connecting to network'
                    : 'Network disconnected'
                }
              />
            </div>
            {Number.isFinite(parsedBlockNumber) && (
              <div className="nb-stat-card">
                <Box size={14} className="text-[var(--nb-text-muted)]" />
                <span className="text-xs font-mono font-bold text-[var(--nb-foreground)]">
                  #{parsedBlockNumber.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 nb-animate-in">
              <TreasuryPanel refreshKey={refreshKey} />
              <AgentsPanel refreshKey={refreshKey} />
            </div>
            <div className="nb-animate-in nb-delay-200">
              <ProposalsPanel refreshKey={refreshKey} />
            </div>
          </div>
          <div className="lg:col-span-1 nb-animate-in nb-delay-300">
            <TriggerPanel onComplete={handleTriggerComplete} />
          </div>
        </div>

        <footer className="mt-12 pt-6 border-t-[3px] border-[var(--nb-border)]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--nb-foreground)] uppercase tracking-wider px-3 py-1.5 rounded border-2 border-[var(--nb-border)] bg-[var(--nb-violet-bg)] shadow-[var(--nb-shadow-sm)]">
                <Zap size={12} />
                Contracts deployed on Monad Testnet
              </span>
            </div>

            <div className="flex items-center gap-3 flex-wrap justify-center">
              {CONTRACT_LINKS.map((c) => (
                <a
                  key={c.name}
                  href={explorerAddressUrl(c.address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`View ${c.name} on the block explorer (opens in a new tab)`}
                  className="flex items-center gap-1.5 text-xs font-bold text-[var(--nb-foreground)] px-2.5 py-1 rounded border-2 border-[var(--nb-border)] bg-[var(--nb-bg-secondary)] shadow-[var(--nb-shadow-sm)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                >
                  <span>{c.name}</span>
                  <ExternalLink size={10} />
                </a>
              ))}
            </div>
          </div>

          <p className="text-center text-xs font-bold text-[var(--nb-text-muted)] mt-6 pb-4 uppercase tracking-widest">
            An AI company running itself - Powered by autonomous agents
          </p>
        </footer>
      </div>
    </main>
  );
}