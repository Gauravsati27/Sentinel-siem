import React, { useState } from 'react';
import { SecurityAlert, AttackingIP } from '../types';

interface InvestigateModalProps {
  target: { alert?: SecurityAlert; ipData?: AttackingIP } | null;
  onClose: () => void;
  onBlockIp: (ip: string) => void;
  onUpdateStatus: (alertId: string, status: SecurityAlert['status']) => void;
}

export const InvestigateModal: React.FC<InvestigateModalProps> = ({
  target,
  onClose,
  onBlockIp,
  onUpdateStatus
}) => {
  if (!target) return null;

  const [copiedRule, setCopiedRule] = useState(false);
  const [webhookSent, setWebhookSent] = useState(false);
  const [analystNote, setAnalystNote] = useState(
    target.alert?.analystNotes || 'Investigating high frequency anomalous requests.'
  );

  const ip = target.ipData?.ip || target.alert?.sourceIp || '185.17.43.99';
  const country = target.ipData?.country || target.alert?.country || 'Unknown';
  const countryCode = target.ipData?.countryCode || target.alert?.countryCode || 'XX';
  const riskScore = target.ipData?.riskScore || (target.alert?.severity === 'critical' ? 95 : 75);
  const asn = target.ipData?.asn || 'AS49505 Selectel Hosting';
  const isBlocked = target.ipData?.status === 'blocked' || target.alert?.blocked;

  const firewallCmd = `# Sentinel SIEM Auto-Generated Rule\niptables -A INPUT -s ${ip} -j DROP\n# AWS VPC Network ACL\naws ec2 create-network-acl-entry --network-acl-id acl-09218 --rule-number 100 --protocol -1 --rule-action deny --cidr-block ${ip}/32 --ingress`;

  const copyFirewallRule = () => {
    navigator.clipboard.writeText(firewallCmd);
    setCopiedRule(true);
    setTimeout(() => setCopiedRule(false), 2000);
  };

  const triggerWebhook = () => {
    setWebhookSent(true);
    setTimeout(() => setWebhookSent(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#060e20]/80 backdrop-blur-xs p-4 overflow-y-auto select-none">
      <div className="w-full max-w-2xl bg-[#171f33] border border-[#3b494b] rounded shadow-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#3b494b] pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-[#ffb4ab]/10 border border-[#ffb4ab]/40 flex items-center justify-center text-[#ffb4ab]">
              <span className="material-symbols-outlined text-[22px]">security</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono text-base font-bold text-[#dae2fd]">
                  Threat Dossier: <span className="text-[#00dbe9]">{ip}</span>
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#2d3449] text-[#ffe179] border border-[#3b494b]">
                  {countryCode} • {country}
                </span>
              </div>
              <p className="text-xs text-[#849495] font-mono mt-0.5">
                ASN: {asn}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#849495] hover:text-[#dae2fd] p-1.5 rounded hover:bg-[#2d3449] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Threat Level & Summary Cards */}
        <div className="grid grid-cols-3 gap-2 text-center font-mono">
          <div className="p-2.5 rounded bg-[#2d3449] border border-[#3b494b]">
            <span className="text-[10px] text-[#849495] uppercase">Risk Score</span>
            <div className="text-lg font-bold text-[#ffb4ab] mt-1">{riskScore}/100</div>
          </div>
          <div className="p-2.5 rounded bg-[#2d3449] border border-[#3b494b]">
            <span className="text-[10px] text-[#849495] uppercase">Mitigation Status</span>
            <div className={`text-xs font-bold mt-2 ${isBlocked ? 'text-[#ffb4ab]' : 'text-[#00dbe9]'}`}>
              {isBlocked ? 'BLOCKED' : 'ACTIVE / UNBLOCKED'}
            </div>
          </div>
          <div className="p-2.5 rounded bg-[#2d3449] border border-[#3b494b]">
            <span className="text-[10px] text-[#849495] uppercase">Reputation</span>
            <div className="text-xs font-bold text-[#ffe179] mt-2">Known Malicious VPS</div>
          </div>
        </div>

        {/* If target has alert info */}
        {target.alert && (
          <div className="p-3 bg-[#2d3449] rounded border border-[#3b494b] space-y-2 font-mono">
            <div className="flex justify-between text-xs">
              <span className="text-[#849495]">Incident Event:</span>
              <span className="text-[#ffb4ab] font-bold">
                {target.alert.eventType}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#849495]">Rule Triggered:</span>
              <span className="text-[#00dbe9] text-[11px]">
                {target.alert.ruleTriggered}
              </span>
            </div>
            <div className="text-xs text-[#dae2fd] pt-1 border-t border-[#3b494b]">
              {target.alert.description}
            </div>
          </div>
        )}

        {/* Raw Log Inspection */}
        <div className="space-y-1.5 font-mono">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#849495] font-bold uppercase">Raw Intercepted Payload:</span>
            <span className="text-[10px] text-[#00dbe9]">Grok Parsed</span>
          </div>
          <div className="p-3 bg-[#0b1326] rounded border border-[#3b494b] text-[11px] text-[#dae2fd] break-all select-text overflow-x-auto">
            <code>
              {target.alert?.rawLogSample ||
                `${ip} - - [27/Oct/2023:14:32:01 +0000] "POST /admin/login HTTP/1.1" 401 532 "https://corp-internal.net/admin" "Hydra/v9.4 (Linux)"`}
            </code>
          </div>
        </div>

        {/* Generated Firewall Rule */}
        <div className="space-y-1.5 font-mono">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#849495] font-bold uppercase">Firewall Mitigation Rule:</span>
            <button
              onClick={copyFirewallRule}
              className="text-[11px] text-[#00dbe9] hover:underline flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">
                {copiedRule ? 'check' : 'content_copy'}
              </span>
              <span>{copiedRule ? 'Copied to Clipboard!' : 'Copy Rule'}</span>
            </button>
          </div>
          <pre className="p-2.5 bg-[#0b1326] rounded border border-[#3b494b] text-[10px] text-[#00dbe9] overflow-x-auto">
            {firewallCmd}
          </pre>
        </div>

        {/* Analyst Investigation Notes */}
        <div className="space-y-1 font-mono">
          <label className="text-xs text-[#849495] font-bold uppercase">
            SOC Analyst Investigation Log:
          </label>
          <textarea
            value={analystNote}
            onChange={(e) => setAnalystNote(e.target.value)}
            rows={2}
            className="w-full bg-[#0b1326] border border-[#3b494b] rounded p-2 text-xs text-[#dae2fd] focus:outline-none focus:border-[#00dbe9]"
            placeholder="Enter incident response notes..."
          />
        </div>

        {/* Actions Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#3b494b] font-mono">
          <div className="flex items-center gap-2">
            <button
              onClick={triggerWebhook}
              className="px-3 py-1.5 bg-[#2d3449] border border-[#3b494b] hover:border-[#00dbe9] rounded text-xs text-[#dae2fd] flex items-center gap-1.5 transition-all"
            >
              <span className="material-symbols-outlined text-[16px] text-[#00dbe9]">
                send
              </span>
              <span>{webhookSent ? 'Escalated!' : 'Escalate to Webhook'}</span>
            </button>

            {target.alert && (
              <button
                onClick={() => {
                  onUpdateStatus(target.alert!.id, 'auto-closed');
                  onClose();
                }}
                className="px-3 py-1.5 bg-[#2d3449] border border-[#3b494b] hover:border-[#ffe179] rounded text-xs text-[#849495] hover:text-[#ffe179] transition-all"
              >
                Mark False Positive
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isBlocked ? (
              <button
                onClick={() => {
                  onBlockIp(ip);
                  if (target.alert) onUpdateStatus(target.alert.id, 'reviewing');
                  onClose();
                }}
                className="px-4 py-1.5 bg-[#93000a] text-[#ffb4ab] border border-[#ffb4ab]/40 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-[#ffb4ab] hover:text-[#690005] transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">block</span>
                <span>Ban IP in Firewall</span>
              </button>
            ) : (
              <span className="px-3 py-1.5 bg-[#93000a]/20 text-[#ffb4ab] border border-[#ffb4ab]/40 rounded text-xs">
                IP is currently Blocked
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
