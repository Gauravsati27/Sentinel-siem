import React, { useState } from 'react';
import { DetectionRule, LogEvent, SecurityAlert } from '../types';
import { parseRawLogLine, evaluateDetectionRules } from '../utils/detectionEngine';
import { PRESET_ATTACK_SCENARIOS } from '../data/mockSiemData';

interface RuleEngineViewProps {
  rules: DetectionRule[];
  onToggleRule: (ruleId: string) => void;
  onIngestNewLogs: (logs: LogEvent[], newAlerts: SecurityAlert[]) => void;
}

export const RuleEngineView: React.FC<RuleEngineViewProps> = ({
  rules,
  onToggleRule,
  onIngestNewLogs
}) => {
  const [inputLogText, setInputLogText] = useState<string>(
    '185.17.43.99 - - [27/Oct/2023:14:32:01 +0000] "POST /admin/login HTTP/1.1" 401 532 "-" "Hydra/9.4"\n185.17.43.99 - - [27/Oct/2023:14:32:02 +0000] "POST /admin/login HTTP/1.1" 401 532 "-" "Hydra/9.4"\n185.17.43.99 - - [27/Oct/2023:14:32:03 +0000] "POST /admin/login HTTP/1.1" 401 532 "-" "Hydra/9.4"\n185.17.43.99 - - [27/Oct/2023:14:32:04 +0000] "POST /admin/login HTTP/1.1" 401 532 "-" "Hydra/9.4"\n185.17.43.99 - - [27/Oct/2023:14:32:05 +0000] "POST /admin/login HTTP/1.1" 401 532 "-" "Hydra/9.4"\n185.17.43.99 - - [27/Oct/2023:14:32:06 +0000] "POST /admin/login HTTP/1.1" 401 532 "-" "Hydra/9.4"'
  );
  const [ingestStatus, setIngestStatus] = useState<string | null>(null);

  const handleTestIngest = () => {
    const lines = inputLogText.split('\n').filter((l) => l.trim().length > 0);
    const parsedLogs: LogEvent[] = [];

    for (const line of lines) {
      const parsed = parseRawLogLine(line);
      if (parsed && parsed.id) {
        parsedLogs.push(parsed as LogEvent);
      }
    }

    // Evaluate rules
    const detectedAlerts = evaluateDetectionRules(parsedLogs, rules);
    onIngestNewLogs(parsedLogs, detectedAlerts);

    setIngestStatus(
      `Successfully ingested & parsed ${parsedLogs.length} events. Triggered ${detectedAlerts.length} detection alert(s)!`
    );
    setTimeout(() => setIngestStatus(null), 5000);
  };

  const loadSampleScenario = (scenarioId: string) => {
    if (scenarioId === 'attack_ssh_brute') {
      setInputLogText(
        `Oct 27 14:32:01 secure-gw sshd[1942]: Failed password for root from 185.17.43.99 port 52210 ssh2\n` +
        `Oct 27 14:32:02 secure-gw sshd[1943]: Failed password for root from 185.17.43.99 port 52212 ssh2\n` +
        `Oct 27 14:32:03 secure-gw sshd[1944]: Failed password for admin from 185.17.43.99 port 52214 ssh2\n` +
        `Oct 27 14:32:04 secure-gw sshd[1945]: Failed password for root from 185.17.43.99 port 52216 ssh2\n` +
        `Oct 27 14:32:05 secure-gw sshd[1946]: Failed password for ubuntu from 185.17.43.99 port 52218 ssh2\n` +
        `Oct 27 14:32:06 secure-gw sshd[1947]: Failed password for postgres from 185.17.43.99 port 52220 ssh2`
      );
    } else if (scenarioId === 'attack_sqli_wave') {
      setInputLogText(
        `91.200.12.5 - - [27/Oct/2023:14:21:04 +0000] "GET /api/v2/catalog?category=electronics' UNION SELECT null,username,password_hash FROM users-- HTTP/1.1" 403 312 "-" "sqlmap/1.6"`
      );
    } else if (scenarioId === 'attack_dotfile_crawler') {
      setInputLogText(
        `103.245.236.1 - - [27/Oct/2023:14:15:32 +0000] "GET /.env HTTP/1.1" 404 162 "-" "masscan/1.3"\n` +
        `103.245.236.1 - - [27/Oct/2023:14:15:33 +0000] "GET /.git/config HTTP/1.1" 404 162 "-" "masscan/1.3"\n` +
        `103.245.236.1 - - [27/Oct/2023:14:15:34 +0000] "GET /actuator/env HTTP/1.1" 404 162 "-" "masscan/1.3"`
      );
    }
  };

  return (
    <div className="space-y-4 select-none">
      {/* Top Banner */}
      <div className="p-4 bg-[#171f33] border border-[#3b494b] rounded flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00dbe9] text-[22px]">upload_file</span>
            <h2 className="font-mono text-base font-bold text-[#dae2fd]">
              Log Ingestion & Detection Rule Engine
            </h2>
          </div>
          <p className="text-xs text-[#849495] font-mono mt-1">
            Configure sliding-window heuristic detection rules and test parser against raw multi-line logs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column: Configured SIEM Rules */}
        <div className="p-4 bg-[#171f33] border border-[#3b494b] rounded flex flex-col gap-3">
          <div className="flex justify-between items-center border-b border-[#3b494b] pb-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#00dbe9] text-[18px]">rule</span>
              <h3 className="font-mono text-xs font-bold text-[#dae2fd] uppercase">
                Active SIEM Correlation Rules ({rules.filter(r => r.enabled).length}/{rules.length})
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[#00dbe9]">Python/Grok Logic</span>
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-[600px] pr-1 font-mono">
            {rules.map((rule) => {
              const sevBadge =
                rule.severity === 'critical'
                  ? 'text-[#ffb4ab] border-[#ffb4ab]/40 bg-[#ffb4ab]/10'
                  : rule.severity === 'high'
                  ? 'text-[#ffe179] border-[#ffe179]/40 bg-[#ffe179]/10'
                  : 'text-[#00dbe9] border-[#00dbe9]/40 bg-[#00dbe9]/10';

              return (
                <div
                  key={rule.id}
                  className={`p-3 rounded border transition-all ${
                    rule.enabled
                      ? 'bg-[#2d3449] border-[#3b494b] hover:border-[#00dbe9]/60'
                      : 'bg-[#0b1326] border-[#3b494b]/30 opacity-60'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border uppercase ${sevBadge}`}>
                        {rule.severity}
                      </span>
                      <span className="font-mono text-xs font-bold text-[#dae2fd]">
                        {rule.name}
                      </span>
                    </div>

                    <button
                      onClick={() => onToggleRule(rule.id)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                        rule.enabled
                          ? 'bg-[#00dbe9]/20 text-[#00dbe9] border border-[#00dbe9]'
                          : 'bg-[#0b1326] text-[#849495] border border-[#3b494b]'
                      }`}
                    >
                      {rule.enabled ? 'ENABLED' : 'DISABLED'}
                    </button>
                  </div>

                  <p className="text-xs text-[#849495] mt-1.5">
                    {rule.description}
                  </p>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#3b494b]/40 text-[10px] font-mono text-[#849495]">
                    <span>Rule ID: <code className="text-[#00dbe9]">{rule.id}</code></span>
                    <span>Triggered: <strong className="text-[#dae2fd]">{rule.matchCount} times</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live Ingestion & Parsing Test Console */}
        <div className="p-4 bg-[#171f33] border border-[#3b494b] rounded flex flex-col gap-3 font-mono">
          <div className="flex justify-between items-center border-b border-[#3b494b] pb-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#ffe179] text-[18px]">terminal</span>
              <h3 className="font-mono text-xs font-bold text-[#dae2fd] uppercase">
                Raw Log Ingest & Test Parser
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[#849495]">Regex & Sliding-Window</span>
          </div>

          {/* Preset Attack Scenarios */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-[#849495] font-bold">
              Load Preset Attack Dataset:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_ATTACK_SCENARIOS.map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => loadSampleScenario(sc.id)}
                  className="px-2 py-1 rounded bg-[#2d3449] border border-[#3b494b] hover:border-[#ffe179] text-xs font-mono text-[#dae2fd] hover:text-[#ffe179] transition-all"
                >
                  {sc.type}
                </button>
              ))}
            </div>
          </div>

          {/* Paste Raw Log Textarea */}
          <div className="space-y-1 flex-1 flex flex-col">
            <label className="text-[11px] font-mono text-[#849495] font-bold">
              Unstructured Raw Log Stream Input:
            </label>
            <textarea
              value={inputLogText}
              onChange={(e) => setInputLogText(e.target.value)}
              rows={9}
              className="w-full flex-1 bg-[#0b1326] border border-[#3b494b] rounded p-2.5 font-mono text-xs text-[#dae2fd] focus:outline-none focus:border-[#00dbe9] resize-none"
              placeholder="Paste raw Apache, Nginx, or syslog entries here..."
            />
          </div>

          {/* Status Message */}
          {ingestStatus && (
            <div className="p-2.5 rounded bg-[#00dbe9]/10 border border-[#00dbe9]/40 font-mono text-xs text-[#00dbe9] flex items-center gap-2 animate-fadeIn">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>{ingestStatus}</span>
            </div>
          )}

          {/* Ingest Action Button */}
          <button
            onClick={handleTestIngest}
            className="w-full py-2.5 bg-[#00dbe9] hover:bg-[#7df4ff] text-[#00363a] font-mono font-bold text-xs rounded flex items-center justify-center gap-2 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">play_circle</span>
            <span>Execute Ingest Parser & Run Detection Rules</span>
          </button>
        </div>
      </div>
    </div>
  );
};
