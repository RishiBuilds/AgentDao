'use client';

import {
  Clock,
  Vote,
  XCircle,
  CheckCircle2,
  Zap,
  FileText,
  Megaphone,
  TrendingUp,
  Settings,
  Shield,
  Bot,
  ThumbsUp,
  ThumbsDown,
  type LucideIcon,
} from 'lucide-react';

/* ─── Status Icon: maps proposal states to icons ─── */

interface StatusIconProps {
  state: string;
  size?: number;
  className?: string;
}

const stateConfig: Record<string, { icon: LucideIcon; colorClass: string }> = {
  Pending:   { icon: Clock,        colorClass: 'text-amber-400' },
  Active:    { icon: Vote,         colorClass: 'text-blue-400' },
  Defeated:  { icon: XCircle,      colorClass: 'text-rose-400' },
  Succeeded: { icon: CheckCircle2, colorClass: 'text-emerald-400' },
  Executed:  { icon: Zap,          colorClass: 'text-violet-400' },
};

export function StatusIcon({ state, size = 16, className = '' }: StatusIconProps) {
  const config = stateConfig[state] || { icon: FileText, colorClass: 'text-gray-400' };
  const Icon = config.icon;
  return <Icon size={size} className={`${config.colorClass} ${className}`} />;
}

export function getStateBadgeClass(state: string): string {
  switch (state) {
    case 'Pending':   return 'badge badge-pending';
    case 'Active':    return 'badge badge-active';
    case 'Defeated':  return 'badge badge-defeated';
    case 'Succeeded': return 'badge badge-succeeded';
    case 'Executed':  return 'badge badge-executed';
    default:          return 'badge';
  }
}

/* ─── Role Icon: maps agent roles to icons ─── */

interface RoleIconProps {
  role: string;
  size?: number;
  className?: string;
}

const roleConfig: Record<string, { icon: LucideIcon; bgClass: string; colorClass: string }> = {
  Marketing:  { icon: Megaphone,   bgClass: 'bg-violet-500/15', colorClass: 'text-violet-400' },
  Finance:    { icon: TrendingUp,  bgClass: 'bg-emerald-500/15', colorClass: 'text-emerald-400' },
  Operations: { icon: Settings,    bgClass: 'bg-cyan-500/15',   colorClass: 'text-cyan-400' },
  Security:   { icon: Shield,      bgClass: 'bg-amber-500/15',  colorClass: 'text-amber-400' },
};

export function RoleIcon({ role, size = 18, className = '' }: RoleIconProps) {
  const key = Object.keys(roleConfig).find(k =>
    role.toLowerCase().includes(k.toLowerCase())
  );
  const config = key ? roleConfig[key] : { icon: Bot, bgClass: 'bg-blue-500/15', colorClass: 'text-blue-400' };
  const Icon = config.icon;

  return (
    <div className={`agent-avatar ${config.bgClass} ${className}`}>
      <Icon size={size} className={config.colorClass} />
    </div>
  );
}

interface GlowIconProps {
  icon: LucideIcon;
  size?: number;
  glowClass?: string; // e.g. 'icon-glow-violet'
  className?: string;
}

export function GlowIcon({ icon: Icon, size = 20, glowClass = 'icon-glow-violet', className = '' }: GlowIconProps) {
  return (
    <div className={`icon-container ${glowClass} ${className}`}>
      <Icon size={size} />
    </div>
  );
}

/* ─── Vote Icons ─── */

export function VoteForIcon({ size = 14 }: { size?: number }) {
  return <ThumbsUp size={size} className="text-emerald-400" />;
}

export function VoteAgainstIcon({ size = 14 }: { size?: number }) {
  return <ThumbsDown size={size} className="text-rose-400" />;
}
