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

interface StatusIconProps {
  state: string;
  size?: number;
  className?: string;
}

const stateConfig: Record<string, { icon: LucideIcon; colorClass: string }> = {
  Pending:   { icon: Clock,        colorClass: 'text-amber-600' },
  Active:    { icon: Vote,         colorClass: 'text-blue-600' },
  Defeated:  { icon: XCircle,      colorClass: 'text-rose-600' },
  Succeeded: { icon: CheckCircle2, colorClass: 'text-emerald-600' },
  Executed:  { icon: Zap,          colorClass: 'text-violet-600' },
};

export function StatusIcon({ state, size = 16, className = '' }: StatusIconProps) {
  const config = stateConfig[state] || { icon: FileText, colorClass: 'text-gray-600' };
  const Icon = config.icon;
  return <Icon size={size} className={`${config.colorClass} ${className}`} />;
}

export function getStateBadgeClass(state: string): string {
  switch (state) {
    case 'Pending':   return 'nb-badge nb-badge-pending';
    case 'Active':    return 'nb-badge nb-badge-active';
    case 'Defeated':  return 'nb-badge nb-badge-defeated';
    case 'Succeeded': return 'nb-badge nb-badge-succeeded';
    case 'Executed':  return 'nb-badge nb-badge-executed';
    default:          return 'nb-badge';
  }
}

interface RoleIconProps {
  role: string;
  size?: number;
  className?: string;
}

const roleConfig: Record<string, { icon: LucideIcon; bgClass: string; colorClass: string }> = {
  Marketing:  { icon: Megaphone,   bgClass: 'nb-icon-violet', colorClass: 'text-violet-700' },
  Finance:    { icon: TrendingUp,  bgClass: 'nb-icon-emerald', colorClass: 'text-emerald-700' },
  Operations: { icon: Settings,    bgClass: 'nb-icon-cyan',   colorClass: 'text-cyan-700' },
  Security:   { icon: Shield,      bgClass: 'nb-icon-amber',  colorClass: 'text-amber-700' },
};

export function RoleIcon({ role, size = 18, className = '' }: RoleIconProps) {
  const key = Object.keys(roleConfig).find(k =>
    role.toLowerCase().includes(k.toLowerCase())
  );
  const config = key ? roleConfig[key] : { icon: Bot, bgClass: 'nb-icon-blue', colorClass: 'text-blue-700' };
  const Icon = config.icon;

  return (
    <div className={`nb-agent-avatar ${config.bgClass} ${className}`}>
      <Icon size={size} className={config.colorClass} />
    </div>
  );
}

interface GlowIconProps {
  icon: LucideIcon;
  size?: number;
  glowClass?: string;
  className?: string;
}

export function GlowIcon({ icon: Icon, size = 20, glowClass = 'nb-icon-violet', className = '' }: GlowIconProps) {
  return (
    <div className={`nb-icon-container ${glowClass} ${className}`}>
      <Icon size={size} />
    </div>
  );
}

export function VoteForIcon({ size = 14 }: { size?: number }) {
  return <ThumbsUp size={size} className="text-emerald-600" />;
}

export function VoteAgainstIcon({ size = 14 }: { size?: number }) {
  return <ThumbsDown size={size} className="text-rose-600" />;
}
