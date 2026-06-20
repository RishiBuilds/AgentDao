'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import { GlowIcon } from './Icons';

interface TriggerPanelProps {
  onComplete: () => void;
}

interface RunLog {
  step: string;
  timestamp: string;
  status: string;
  message: string;
}

const logIcons: Record<string, React.ReactNode> = {
  autonomous_start: <Rocket size={12} />,
  marketing_proposal: <Megaphone size={12} />,
  finance_review: <Briefcase size={12} />,
  on_chain_submit: <Link size={12} />,
  waiting: <Timer size={12} />,
  voting: <Vote size={12} />,
  checking: <BarChart3 size={12} />,
  result: <Zap size={12} />,
  complete: <Sparkles size={12} />,
  error: <XCircle size={12} />,
};

export default function TriggerPanel({ onComplete }: TriggerPanelProps) {
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<RunLog[]>([]);
  const [scenario, setScenario] = useState('small');

  const scenarios = {
    small: {
      name: 'Small Campaign',
      description: 'Social media campaign, 0.1–0.15 MON, likely approved',
      icon: <CircleDot size={14} className="text-emerald-600" />,
      prompt:
        'Create a focused Twitter campaign for Web3 developers. Budget: 0.12 MON for sponsored tweets. Duration: 1 week.',
    },
    large: {
      name: 'Large Campaign',
      description: 'Massive advertising, 0.7–0.8 MON, likely rejected',
      icon: <Zap size={14} className="text-rose-600" />,
      prompt:
        'Launch a massive global advertising blitz across TV and billboards. Budget: 0.75 MON for 2-month campaign.',
    },
    medium: {
      name: 'Medium Campaign',
      description: 'Experimental project, 0.25 MON, edge case',
      icon: <BarChart3 size={14} className="text-amber-600" />,
      prompt:
        'Run an experimental NFT drop campaign. Budget: 0.25 MON for smart contracts and marketing. Uncertain ROI.',
    },
  };

  const runAutonomousLoop = async () => {
    setRunning(true);
    setLogs([]);

    try {
      addLog('autonomous_start', 'Starting autonomous loop...', 'info');

      addLog('marketing_proposal', 'Marketing Agent generating proposal...', 'info');
      await delay(2000);
      addLog('marketing_proposal', 'Proposal generated successfully', 'success');

      addLog('finance_review', 'Finance Agent reviewing budget...', 'info');
      await delay(2000);
      addLog('finance_review', 'Financial decision complete', 'success');

      addLog('on_chain_submit', 'Submitting proposal on-chain...', 'info');
      await delay(3000);
      addLog('on_chain_submit', 'Proposal created on Monad', 'success');

      addLog('waiting', 'Waiting for voting period...', 'info');
      await delay(5000);
      addLog('waiting', 'Voting period active', 'success');

      addLog('voting', 'Casting vote on-chain...', 'info');
      await delay(3000);
      addLog('voting', 'Vote recorded on-chain', 'success');

      addLog('checking', 'Checking proposal state...', 'info');
      await delay(2000);

      if (scenario === 'small' || scenario === 'medium') {
        addLog('result', 'Proposal approved — vote recorded on-chain', 'success');
      } else {
        addLog('result', 'Proposal rejected — vote recorded on-chain', 'error');
      }

      addLog('complete', 'Autonomous loop complete!', 'success');
      onComplete();
    } catch (error) {
      addLog('error', `Error: ${error}`, 'error');
    } finally {
      setRunning(false);
    }
  };

  const addLog = (step: string, message: string, status: string) => {
    setLogs(prev => [
      ...prev,
      {
        step,
        timestamp: new Date().toLocaleTimeString(),
        status,
        message,
      },
    ]);
  };

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const getTimelineDotClass = (status: string) => {
    switch (status) {
      case 'success':
        return 'nb-timeline-dot-success';
      case 'error':
        return 'nb-timeline-dot-error';
      default:
        return 'nb-timeline-dot-info';
    }
  };

  return (
    <div className="nb-card-elevated p-6 sticky top-8">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--nb-foreground)]">
          Autonomous Control
        </h2>
        <GlowIcon icon={Play} glowClass="nb-icon-violet" size={18} />
      </div>

      <div className="mb-5">
        <label className="text-xs font-bold text-[var(--nb-text-muted)] uppercase tracking-widest block mb-2.5">
          Select Scenario
        </label>
        <div className="space-y-2">
          {Object.entries(scenarios).map(([key, s]) => (
            <label
              key={key}
              className={`nb-scenario-card flex items-start gap-3 ${
                scenario === key ? 'nb-scenario-card-selected' : ''
              }`}
            >
              <input
                type="radio"
                name="scenario"
                value={key}
                checked={scenario === key}
                onChange={(e) => setScenario(e.target.value)}
                className="sr-only"
                disabled={running}
              />
              <div className="mt-0.5">{s.icon}</div>
              <div>
                <div className="text-sm font-bold text-[var(--nb-foreground)]">
                  {s.name}
                </div>
                <div className="text-xs font-medium text-[var(--nb-text-muted)] mt-0.5 leading-relaxed">
                  {s.description}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={runAutonomousLoop}
        disabled={running}
        className="nb-btn w-full"
      >
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
            {logs.map((log, i) => (
              <div key={i} className="nb-timeline-item pb-3">
                <div className={`nb-timeline-dot ${getTimelineDotClass(log.status)}`} />
                <div className="flex items-start gap-2">
                  <span className="text-[var(--nb-text-muted)] flex-shrink-0 mt-0.5">
                    {logIcons[log.step] || <CircleDot size={12} />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span
                      className={`text-xs font-bold ${
                        log.status === 'success'
                          ? 'text-emerald-700'
                          : log.status === 'error'
                          ? 'text-rose-700'
                          : 'text-[var(--nb-foreground)]'
                      }`}
                    >
                      {log.message}
                    </span>
                    <span className="text-[10px] text-[var(--nb-text-muted)] ml-2 font-mono font-bold">
                      {log.timestamp}
                    </span>
                  </div>
                </div>
              </div>
            ))}
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
          {[
            { icon: <Megaphone size={11} />, text: 'Marketing Agent proposes campaign' },
            { icon: <Briefcase size={11} />, text: 'Finance Agent reviews & decides' },
            { icon: <Link size={11} />, text: 'Proposal submitted on-chain' },
            { icon: <Vote size={11} />, text: 'Vote cast based on AI decision' },
            { icon: <CheckCircle2 size={11} />, text: 'State updated on blockchain' },
          ].map((item, i) => (
            <li
              key={i}
              className="flex items-center gap-2.5 text-xs font-semibold text-amber-900"
            >
              <span className="text-amber-700 flex-shrink-0 w-5 h-5 flex items-center justify-center rounded border border-amber-600 bg-amber-100">
                {item.icon}
              </span>
              {item.text}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
