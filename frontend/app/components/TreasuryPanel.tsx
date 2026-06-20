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
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
          Treasury
        </h2>
        <GlowIcon icon={Wallet} glowClass="icon-glow-emerald" size={18} />
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-10 bg-white/[0.04] rounded-lg w-40" />
          <div className="h-4 bg-white/[0.04] rounded w-24" />
        </div>
      ) : (
        <div>
          <div className="flex items-end gap-2 mb-1">
            <span className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">
              {balance ? formatBalance(balance) : '0.00'}
            </span>
            <span className="text-sm font-semibold text-[var(--accent-emerald)] mb-1">
              MON
            </span>
          </div>

          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex items-center gap-1 text-xs text-[var(--accent-emerald)]">
              <ArrowUpRight size={12} />
              <span className="font-medium">On-chain</span>
            </div>
            <span className="text-[var(--text-muted)]">·</span>
            <span className="text-xs text-[var(--text-tertiary)]">
              Monad Testnet
            </span>
          </div>

          {balanceWei && (
            <div className="mt-4 pt-3 border-t border-white/[0.06]">
              <div className="text-[10px] text-[var(--text-muted)] font-mono">
                {BigInt(balanceWei).toLocaleString()} wei
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
