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

interface StateConfig {
  icon: LucideIcon;
  textColor: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  label: string;
}

const stateConfig: Record<string, StateConfig> = {
  Pending: {
    icon: Clock,
    textColor: 'text-amber-600 dark:text-amber-400',
    badgeBg: 'bg-amber-50 dark:bg-amber-950',
    badgeBorder: 'border-amber-300 dark:border-amber-700',
    badgeText: 'text-amber-800 dark:text-amber-200',
    label: 'Pending',
  },
  Active: {
    icon: Vote,
    textColor: 'text-blue-600 dark:text-blue-400',
    badgeBg: 'bg-blue-50 dark:bg-blue-950',
    badgeBorder: 'border-blue-300 dark:border-blue-700',
    badgeText: 'text-blue-800 dark:text-blue-200',
    label: 'Active',
  },
  Defeated: {
    icon: XCircle,
    textColor: 'text-rose-600 dark:text-rose-400',
    badgeBg: 'bg-rose-50 dark:bg-rose-950',
    badgeBorder: 'border-rose-300 dark:border-rose-700',
    badgeText: 'text-rose-800 dark:text-rose-200',
    label: 'Defeated',
  },
  Succeeded: {
    icon: CheckCircle2,
    textColor: 'text-emerald-600 dark:text-emerald-400',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950',
    badgeBorder: 'border-emerald-300 dark:border-emerald-700',
    badgeText: 'text-emerald-800 dark:text-emerald-200',
    label: 'Succeeded',
  },
  Executed: {
    icon: Zap,
    textColor: 'text-violet-600 dark:text-violet-400',
    badgeBg: 'bg-violet-50 dark:bg-violet-950',
    badgeBorder: 'border-violet-300 dark:border-violet-700',
    badgeText: 'text-violet-800 dark:text-violet-200',
    label: 'Executed',
  },
};

const fallbackState: StateConfig = {
  icon: FileText,
  textColor: 'text-[var(--nb-text-muted)]',
  badgeBg: 'bg-[var(--nb-bg)]',
  badgeBorder: 'border-[var(--nb-border)]',
  badgeText: 'text-[var(--nb-text-muted)]',
  label: 'Unknown',
};

interface StatusIconProps {
  state: string;
  size?: number;
  className?: string;
}

export function StatusIcon({ state, size = 16, className = '' }: StatusIconProps) {
  const cfg = stateConfig[state] ?? fallbackState;
  const Icon = cfg.icon;
  return (
    <Icon
      size={size}
      className={`${cfg.textColor} ${className}`}
      aria-label={`Status: ${cfg.label}`}
    />
  );
}

interface StateBadgeProps {
  state: string;
  showIcon?: boolean;
  className?: string;
}

export function StateBadge({ state, showIcon = true, className = '' }: StateBadgeProps) {
  const cfg = stateConfig[state] ?? fallbackState;
  const Icon = cfg.icon;

  return (
    <span
      className={[
        'inline-flex items-center gap-1 px-2 py-0.5 rounded',
        'text-[11px] font-bold tracking-wide border',
        cfg.badgeBg,
        cfg.badgeBorder,
        cfg.badgeText,
        className,
      ].join(' ')}
    >
      {showIcon && <Icon size={11} aria-hidden="true" />}
      {cfg.label}
    </span>
  );
}

export function getStateBadgeClass(state: string): string {
  const cfg = stateConfig[state] ?? fallbackState;
  return `inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold border ${cfg.badgeBg} ${cfg.badgeBorder} ${cfg.badgeText}`;
}

interface RoleConfig {
  icon: LucideIcon;
  avatarBg: string;
  avatarText: string;
  label: string;
}

const roleConfig: Record<string, RoleConfig> = {
  marketing: {
    icon: Megaphone,
    avatarBg: 'bg-violet-100 dark:bg-violet-900',
    avatarText: 'text-violet-700 dark:text-violet-300',
    label: 'Marketing',
  },
  finance: {
    icon: TrendingUp,
    avatarBg: 'bg-emerald-100 dark:bg-emerald-900',
    avatarText: 'text-emerald-700 dark:text-emerald-300',
    label: 'Finance',
  },
  operations: {
    icon: Settings,
    avatarBg: 'bg-sky-100 dark:bg-sky-900',
    avatarText: 'text-sky-700 dark:text-sky-300',
    label: 'Operations',
  },
  security: {
    icon: Shield,
    avatarBg: 'bg-amber-100 dark:bg-amber-900',
    avatarText: 'text-amber-700 dark:text-amber-300',
    label: 'Security',
  },
};

const fallbackRole: RoleConfig = {
  icon: Bot,
  avatarBg: 'bg-[var(--nb-bg)] border-2 border-[var(--nb-border)]',
  avatarText: 'text-[var(--nb-text-muted)]',
  label: 'Agent',
};

function resolveRole(role: string): RoleConfig {
  const key = Object.keys(roleConfig).find((k) =>
    role.toLowerCase().includes(k)
  );
  return key ? roleConfig[key] : fallbackRole;
}

interface RoleIconProps {
  role: string;
  size?: number;
  className?: string;
}

export function RoleIcon({ role, size = 16, className = '' }: RoleIconProps) {
  const cfg = resolveRole(role);
  const Icon = cfg.icon;

  return (
    <div
      className={[
        'flex items-center justify-center rounded-lg shrink-0',
        'w-8 h-8',
        cfg.avatarBg,
        cfg.avatarText,
        className,
      ].join(' ')}
      aria-label={cfg.label}
      role="img"
    >
      <Icon size={size} aria-hidden="true" />
    </div>
  );
}

interface GlowIconProps {
  icon: LucideIcon;
  size?: number;
  glowClass?: string;
  colorClass?: string;
  className?: string;
  label?: string;
}

export function GlowIcon({
  icon: Icon,
  size = 18,
  glowClass = 'nb-icon-violet',
  colorClass = '',
  className = '',
  label,
}: GlowIconProps) {
  return (
    <div
      className={`nb-icon-container ${glowClass} ${className}`}
      aria-label={label}
      role={label ? 'img' : undefined}
    >
      <Icon size={size} className={colorClass} aria-hidden={!label} />
    </div>
  );
}

interface VoteIconProps {
  size?: number;
  showLabel?: boolean;
}

export function VoteForIcon({ size = 14, showLabel = false }: VoteIconProps) {
  return (
    <span
      className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400"
      aria-label="Vote for"
    >
      <ThumbsUp size={size} aria-hidden="true" />
      {showLabel && <span className="text-[11px] font-bold">For</span>}
    </span>
  );
}

export function VoteAgainstIcon({ size = 14, showLabel = false }: VoteIconProps) {
  return (
    <span
      className="inline-flex items-center gap-1 text-rose-700 dark:text-rose-400"
      aria-label="Vote against"
    >
      <ThumbsDown size={size} aria-hidden="true" />
      {showLabel && <span className="text-[11px] font-bold">Against</span>}
    </span>
  );
}