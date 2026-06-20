'use client';

import { useState, useEffect } from 'react';
import { Wallet, ArrowUpRight } from 'lucide-react';
import { GlowIcon } from './Icons';
import { apiUrl } from '@/lib/config';

interface TreasuryPanelProps {
  refreshKey: number;
}

export default function TreasuryPanel({ refreshKey }: TreasuryPanelProps) {
  const [balance, setBalance] = useState<string | null>(null);
  const [balanceWei, setBalanceWei] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBalance();
  }, [refreshKey]);

  const fetchBalance = async () => {
    try {
      const res = await fetch(apiUrl('/api/treasury/balance'));
      const data = await res.json();
      setBalance(data.data.balance);
      setBalanceWei(data.data.balanceWei);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatBalance = (bal: string) => {
    const num = parseFloat(bal);
    if (num === 0) return '0.00';
    if (num < 0.0001) return '< 0.0001';
    return num.toFixed(4);
  };

  return (
    <div className="nb-card p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--nb-foreground)]">
          Treasury
        </h2>
        <GlowIcon icon={Wallet} glowClass="nb-icon-emerald" size={18} />
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="h-10 bg-[var(--nb-bg)] rounded-md border-2 border-[var(--nb-border)] animate-pulse w-40" />
          <div className="h-4 bg-[var(--nb-bg)] rounded-md border-2 border-[var(--nb-border)] animate-pulse w-24" />
        </div>
      ) : (
        <div>
          <div className="flex items-end gap-3 mb-1">
            <span className="text-4xl font-extrabold text-[var(--nb-foreground)] tracking-tight">
              {balance ? formatBalance(balance) : '0.00'}
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
              <ArrowUpRight size={13} />
              <span>On-chain</span>
            </div>
            <span className="text-[var(--nb-foreground)] font-bold">·</span>
            <span className="text-xs font-semibold text-[var(--nb-text-muted)]">
              Monad Testnet
            </span>
          </div>

          {balanceWei && (
            <div className="mt-4 pt-3 border-t-2 border-[var(--nb-border)]">
              <div className="text-[11px] text-[var(--nb-text-muted)] font-mono font-semibold">
                {BigInt(balanceWei).toLocaleString()} wei
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
