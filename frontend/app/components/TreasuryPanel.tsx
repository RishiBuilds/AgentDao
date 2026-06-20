'use client';

import { useState, useEffect, useCallback } from 'react';
import { Wallet, ArrowUpRight, RefreshCw, AlertCircle, ExternalLink } from 'lucide-react';
import { GlowIcon } from './Icons';
import { apiUrl } from '@/lib/config';

const EXPLORER_BASE = 'https://explorer.testnet.monad.xyz';
const TREASURY_ADDRESS = process.env.NEXT_PUBLIC_TREASURY_ADDRESS;

interface TreasuryData {
  balance: string;
  balanceWei: string;
}

interface TreasuryPanelProps {
  refreshKey: number;
}

function formatBalance(bal: string) {
  const num = parseFloat(bal);
  if (num === 0) return '0.00';
  if (num < 0.0001) return '< 0.0001';
  return num.toFixed(4);
}

function formatWei(weiStr: string) {
  try {
    return BigInt(weiStr).toLocaleString();
  } catch {
    return weiStr;
  }
}

export default function TreasuryPanel({ refreshKey }: TreasuryPanelProps) {
  const [data, setData] = useState<TreasuryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchBalance = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await fetch(apiUrl('/api/treasury/balance'));

      if (!res.ok) throw new Error(`Server returned ${res.status}`);

      const json = await res.json();

      if (json?.success && json.data) {
        setData({ balance: json.data.balance, balanceWei: json.data.balanceWei });
      } else {
        throw new Error('Unexpected response shape');
      }
    } catch {
      setError('Could not fetch balance.');
      setData(null);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBalance();
  }, [refreshKey, fetchBalance]);

  return (
    <div className="nb-card p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--nb-foreground)]">
          Treasury
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchBalance(true)}
            disabled={loading || isRefreshing}
            className="p-1 rounded text-[var(--nb-text-muted)] hover:text-[var(--nb-foreground)] disabled:opacity-40 transition-colors"
            aria-label="Refresh treasury balance"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
          <GlowIcon icon={Wallet} glowClass="nb-icon-emerald" size={18} />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="h-10 bg-[var(--nb-bg)] rounded-md border-2 border-[var(--nb-border)] animate-pulse w-40" />
          <div className="h-4 bg-[var(--nb-bg)] rounded-md border-2 border-[var(--nb-border)] animate-pulse w-24" />
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border-2 border-red-200 text-red-700">
          <AlertCircle size={15} className="shrink-0" />
          <p className="text-xs font-semibold flex-1">{error}</p>
          <button
            onClick={() => fetchBalance(true)}
            className="text-xs font-bold underline underline-offset-2 hover:opacity-70"
          >
            Retry
          </button>
        </div>
      ) : (
        <div>
          <div className="flex items-end gap-3 mb-1">
            <span className="text-4xl font-extrabold text-[var(--nb-foreground)] tracking-tight tabular-nums">
              {data ? formatBalance(data.balance) : '0.00'}
            </span>
            <span
              className="text-sm font-bold uppercase tracking-wider mb-1.5 px-2 py-0.5 rounded border-2 border-[var(--nb-border)] bg-[var(--nb-emerald-bg)] text-emerald-700"
              style={{ boxShadow: '2px 2px 0px 0px #1a1a2e' }}
            >
              MON
            </span>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-700">
              <ArrowUpRight size={13} aria-hidden="true" />
              <span>On-chain</span>
            </div>
            <span className="text-[var(--nb-foreground)] font-bold" aria-hidden="true">·</span>
            <span className="text-xs font-semibold text-[var(--nb-text-muted)]">
              Monad Testnet
            </span>
            {TREASURY_ADDRESS && (
              <a
                href={`${EXPLORER_BASE}/address/${TREASURY_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto flex items-center gap-1 text-[10px] font-bold text-[var(--nb-text-muted)] hover:text-[var(--nb-foreground)] transition-colors"
                aria-label="View treasury on Monad explorer"
              >
                <span className="font-mono">
                  {TREASURY_ADDRESS.slice(0, 6)}…{TREASURY_ADDRESS.slice(-4)}
                </span>
                <ExternalLink size={10} aria-hidden="true" />
              </a>
            )}
          </div>

          {data?.balanceWei && (
            <div className="mt-4 pt-3 border-t-2 border-[var(--nb-border)]">
              <span className="text-[11px] text-[var(--nb-text-muted)] font-mono font-semibold">
                {formatWei(data.balanceWei)} wei
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}