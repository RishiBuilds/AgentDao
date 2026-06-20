'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Play,
  Rocket,
  Megaphone,
  Briefcase,
  Link,
  Timer,
  Vote,
  BarChart3,
  CheckCircle2,
  XCircle,
  Loader2,
  Sparkles,
  Zap,
  CircleDot,
  Info,
  type LucideIcon,
} from 'lucide-react';
import { GlowIcon } from './Icons';

type ScenarioKey = 'small' | 'medium' | 'large';
type LogStatus = 'info' | 'success' | 'error';
type StepKey =
  | 'autonomous_start'
  | 'marketing_proposal'
  | 'finance_review'
  | 'on_chain_submit'
  | 'waiting'
  | 'voting'
  | 'checking'
  | 'result'
  | 'complete'
  | 'error';

interface RunLog {
  id: string;
  step: StepKey;
  timestamp: string;
  status: LogStatus;
  message: string;
}

interface ScenarioConfig {
  name: string;
  description: string;
  icon: LucideIcon;
  iconClassName: string;
  prompt: string;
  outcome: 'approved' | 'rejected';
}

interface SimulationStep {
  step: StepKey;
  message: string;
  status: LogStatus;
  delayMs?: number;
  resolved?: { message: string; status: LogStatus };
}

interface TriggerPanelProps {
  onComplete: () => void;
}

const SCENARIOS: Record<ScenarioKey, ScenarioConfig> = {
  small: {
    name: 'Small Campaign',
    description: 'Social media campaign, 0.1–0.15 MON, likely approved',
    icon: CircleDot,
    iconClassName: 'text-emerald-600',
    prompt:
      'Create a focused Twitter campaign for Web3 developers. Budget: 0.12 MON for sponsored tweets. Duration: 1 week.',
    outcome: 'approved',
  },
  medium: {
    name: 'Medium Campaign',
    description: 'Experimental project, 0.25 MON, edge case',
    icon: BarChart3,
    iconClassName: 'text-amber-600',
    prompt:
      'Run an experimental NFT drop campaign. Budget: 0.25 MON for smart contracts and marketing. Uncertain ROI.',
    outcome: 'approved',
  },
  large: {
    name: 'Large Campaign',
    description: 'Massive advertising, 0.7–0.8 MON, likely rejected',
    icon: Zap,
    iconClassName: 'text-rose-600',
    prompt:
      'Launch a massive global advertising blitz across TV and billboards. Budget: 0.75 MON for 2-month campaign.',
    outcome: 'rejected',
  },
};

const SCENARIO_ORDER: ScenarioKey[] = ['small', 'medium', 'large'];

const STEP_ICONS: Record<StepKey, LucideIcon> = {
  autonomous_start: Rocket,
  marketing_proposal: Megaphone,
  finance_review: Briefcase,
  on_chain_submit: Link,
  waiting: Timer,
  voting: Vote,
  checking: BarChart3,
  result: Zap,
  complete: Sparkles,
  error: XCircle,
};

const HOW_IT_WORKS: { icon: LucideIcon; text: string }[] = [
  { icon: Megaphone, text: 'Marketing Agent proposes campaign' },
  { icon: Briefcase, text: 'Finance Agent reviews & decides' },
  { icon: Link, text: 'Proposal submitted on-chain' },
  { icon: Vote, text: 'Vote cast based on AI decision' },
  { icon: CheckCircle2, text: 'State updated on blockchain' },
];

const TIMELINE_DOT_CLASS: Record<LogStatus, string> = {
  success: 'nb-timeline-dot-success',
  error: 'nb-timeline-dot-error',
  info: 'nb-timeline-dot-info',
};

const MESSAGE_CLASS: Record<LogStatus, string> = {
  success: 'text-emerald-700',
  error: 'text-rose-700',
  info: 'text-[var(--nb-foreground)]',
};

function buildSteps(outcome: 'approved' | 'rejected'): SimulationStep[] {
  return [
    { step: 'autonomous_start', message: 'Starting autonomous loop...', status: 'info' },
    {
      step: 'marketing_proposal',
      message: 'Marketing Agent generating proposal...',
      status: 'info',
      delayMs: 2000,
      resolved: { message: 'Proposal generated successfully', status: 'success' },
    },
    {
      step: 'finance_review',
      message: 'Finance Agent reviewing budget...',
      status: 'info',
      delayMs: 2000,
      resolved: { message: 'Financial decision complete', status: 'success' },
    },
    {
      step: 'on_chain_submit',
      message: 'Submitting proposal on-chain...',
      status: 'info',
      delayMs: 3000,
      resolved: { message: 'Proposal created on Monad', status: 'success' },
    },
    {
      step: 'waiting',
      message: 'Waiting for voting period...',
      status: 'info',
      delayMs: 5000,
      resolved: { message: 'Voting period active', status: 'success' },
    },
    {
      step: 'voting',
      message: 'Casting vote on-chain...',
      status: 'info',
      delayMs: 3000,
      resolved: { message: 'Vote recorded on-chain', status: 'success' },
    },
    {
      step: 'checking',
      message: 'Checking proposal state...',
      status: 'info',
      delayMs: 2000,
    },
    {
      step: 'result',
      message:
        outcome === 'approved'
          ? 'Proposal approved — vote recorded on-chain'
          : 'Proposal rejected — vote recorded on-chain',
      status: outcome === 'approved' ? 'success' : 'error',
    },
    { step: 'complete', message: 'Autonomous loop complete!', status: 'success' },
  ];
}

function createLogId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function TriggerPanel({ onComplete }: TriggerPanelProps) {
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<RunLog[]>([]);
  const [scenario, setScenario] = useState<ScenarioKey>('small');

  const cancelledRef = useRef(false);
  const timeoutIdsRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  useEffect(() => {
    return () => {
      cancelledRef.current = true;
      timeoutIdsRef.current.forEach(clearTimeout);
      timeoutIdsRef.current.clear();
    };
  }, []);

  const wait = useCallback((ms: number) => {
    return new Promise<void>(resolve => {
      const id = setTimeout(() => {
        timeoutIdsRef.current.delete(id);
        resolve();
      }, ms);
      timeoutIdsRef.current.add(id);
    });
  }, []);

  const appendLog = useCallback((step: StepKey, message: string, status: LogStatus) => {
    setLogs(prev => [
      ...prev,
      { id: createLogId(), step, timestamp: new Date().toLocaleTimeString(), status, message },
    ]);
  }, []);

  const runAutonomousLoop = useCallback(async () => {
    if (running) return;

    cancelledRef.current = false;
    setRunning(true);
    setLogs([]);

    try {
      const steps = buildSteps(SCENARIOS[scenario].outcome);

      for (const currentStep of steps) {
        if (cancelledRef.current) return;
        appendLog(currentStep.step, currentStep.message, currentStep.status);

        if (currentStep.delayMs) {
          await wait(currentStep.delayMs);
          if (cancelledRef.current) return;
        }

        if (currentStep.resolved) {
          appendLog(currentStep.step, currentStep.resolved.message, currentStep.resolved.status);
        }
      }

      if (!cancelledRef.current) {
        onComplete();
      }
    } catch (error) {
      if (!cancelledRef.current) {
        appendLog(
          'error',
          error instanceof Error ? error.message : 'Unexpected error occurred',
          'error'
        );
      }
    } finally {
      if (!cancelledRef.current) {
        setRunning(false);
      }
    }
  }, [appendLog, onComplete, running, scenario, wait]);

  const scenarioEntries = useMemo(
    () => SCENARIO_ORDER.map(key => [key, SCENARIOS[key]] as const),
    []
  );

  return (
    <div className="nb-card-elevated p-6 sticky top-8">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--nb-foreground)]">
          Autonomous Control
        </h2>
        <GlowIcon icon={Play} glowClass="nb-icon-violet" size={18} />
      </div>

      <div className="mb-5">
        <span
          id="scenario-label"
          className="text-xs font-bold text-[var(--nb-text-muted)] uppercase tracking-widest block mb-2.5"
        >
          Select Scenario
        </span>
        <div className="space-y-2" role="radiogroup" aria-labelledby="scenario-label">
          {scenarioEntries.map(([key, config]) => {
            const Icon = config.icon;
            const selected = scenario === key;
            return (
              <label
                key={key}
                className={`nb-scenario-card flex items-start gap-3 ${
                  selected ? 'nb-scenario-card-selected' : ''
                }`}
              >
                <input
                  type="radio"
                  name="scenario"
                  value={key}
                  checked={selected}
                  onChange={() => setScenario(key)}
                  disabled={running}
                  className="sr-only"
                />
                <Icon size={14} className={`mt-0.5 ${config.iconClassName}`} />
                <div>
                  <div className="text-sm font-bold text-[var(--nb-foreground)]">
                    {config.name}
                  </div>
                  <div className="text-xs font-medium text-[var(--nb-text-muted)] mt-0.5 leading-relaxed">
                    {config.description}
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      <button onClick={runAutonomousLoop} disabled={running} className="nb-btn w-full">
        {running ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Running...
          </>
        ) : (
          <>
            <Rocket size={16} />
            Trigger Autonomous Run
          </>
        )}
      </button>

      {logs.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xs font-bold text-[var(--nb-text-muted)] uppercase tracking-widest mb-3">
            Live Activity
          </h3>
          <div className="nb-log-container space-y-0 max-h-96 overflow-y-auto p-4">
            {logs.map(log => {
              const StepIcon = STEP_ICONS[log.step] ?? CircleDot;
              return (
                <div key={log.id} className="nb-timeline-item pb-3">
                  <div className={`nb-timeline-dot ${TIMELINE_DOT_CLASS[log.status]}`} />
                  <div className="flex items-start gap-2">
                    <span className="text-[var(--nb-text-muted)] flex-shrink-0 mt-0.5">
                      <StepIcon size={12} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className={`text-xs font-bold ${MESSAGE_CLASS[log.status]}`}>
                        {log.message}
                      </span>
                      <span className="text-[10px] text-[var(--nb-text-muted)] ml-2 font-mono font-bold">
                        {log.timestamp}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-5 nb-info-box p-4">
        <div className="flex items-center gap-1.5 mb-2.5">
          <Info size={12} className="text-amber-700" />
          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest">
            How it works
          </span>
        </div>
        <ol className="space-y-2">
          {HOW_IT_WORKS.map(({ icon: ItemIcon, text }, index) => (
            <li
              key={index}
              className="flex items-center gap-2.5 text-xs font-semibold text-amber-900"
            >
              <span className="text-amber-700 flex-shrink-0 w-5 h-5 flex items-center justify-center rounded border border-amber-600 bg-amber-100">
                <ItemIcon size={11} />
              </span>
              {text}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}