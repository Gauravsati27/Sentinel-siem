import React, { useState } from 'react';
import { AttackingIP } from '../types';

interface ThreatIntelViewProps {
  attackingIps: AttackingIP[];
  onInvestigateIp: (ip: AttackingIP) => void;
  onBlockIp: (ip: string) => void;
  onUnblockIp: (ip: string) => void;
}

export const ThreatIntelView: React.FC<ThreatIntelViewProps> = ({
  attackingIps,
  onInvestigateIp,
  onBlockIp,
  onUnblockIp
}) => {
  const [newBlockIp, setNewBlockIp] = useState('');
  const [blockReason, setBlockReason] = useState('Manual SOC Quarantine');

  const blockedList = attackingIps.filter((ip) => ip.status === 'blocked');

  const handleAddManualBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockIp.trim()) return;
    onBlockIp(newBlockIp.trim());
    setNewBlockIp('');
  };

  const exportBlocklist = () => {
    const ips = attackingIps.filter(ip => ip.status === 'blocked').map(ip => ip.ip);
    const content = `# Sentinel SIEM Threat Feed Export\n# Generated: ${new Date().toISOString()}\n` + ips.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sentinel-ip-blocklist-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 select-none">
      {/* Top Banner */}
      <div className="p-4 bg-[#171f33] border border-[#3b494b] rounded flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00dbe9] text-[22px]">shield</span>
            <h2 className="font-mono text-base font-bold text-[#dae2fd]">
              Threat Intelligence & Perimeter Firewall
            </h2>
          </div>
          <p className="text-xs text-[#849495] font-mono mt-1">
            Real-time reputation feeds, autonomous edge mitigations, and malicious IP quarantine ledger.
          </p>
        </div>

        <button
          onClick={exportBlocklist}
          className="px-3 py-1.5 bg-[#2d3449] border border-[#3b494b] hover:border-[#00dbe9] text-xs font-mono text-[#dae2fd] rounded flex items-center gap-1.5 transition-all self-start md:self-auto"
        >
          <span className="material-symbols-outlined text-[16px] text-[#00dbe9]">file_download</span>
          <span>Export Edge Blocklist</span>
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
        <div className="p-3 bg-[#171f33] border border-[#3b494b] rounded flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#849495] uppercase">Actively Quarantined</span>
            <div className="text-xl font-bold text-[#ffb4ab] mt-0.5">{blockedList.length} IPs</div>
          </div>
          <span className="material-symbols-outlined text-[#ffb4ab] text-[22px]">gavel</span>
        </div>

        <div className="p-3 bg-[#171f33] border border-[#3b494b] rounded flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#849495] uppercase">Top Threat Origin</span>
            <div className="text-xl font-bold text-[#ffe179] mt-0.5">Russia (RU - 35%)</div>
          </div>
          <span className="material-symbols-outlined text-[#ffe179] text-[22px]">public</span>
        </div>

        <div className="p-3 bg-[#171f33] border border-[#3b494b] rounded flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#849495] uppercase">Feed Integrity</span>
            <div className="text-xl font-bold text-[#00dbe9] mt-0.5">Sliding Sync OK</div>
          </div>
          <span className="material-symbols-outlined text-[#00dbe9] text-[22px]">verified_user</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Known Attacking IPs Intelligence Table */}
        <div className="p-4 bg-[#171f33] border border-[#3b494b] rounded col-span-1 lg:col-span-2 flex flex-col gap-3 font-mono">
          <div className="flex justify-between items-center border-b border-[#3b494b] pb-2">
            <h3 className="font-mono text-xs font-bold text-[#dae2fd] uppercase">
              Monitored Threat Actors & Known Scanning Nodes
            </h3>
            <span className="text-[10px] font-mono text-[#849495]">
              {attackingIps.length} Nodes Indexed
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="bg-[#0b1326] border-b border-[#3b494b] text-[#849495] text-[10px] uppercase">
                  <th className="py-2 pl-2">IP Address</th>
                  <th className="py-2">Geo Origin</th>
                  <th className="py-2">Risk</th>
                  <th className="py-2">Primary TTP</th>
                  <th className="py-2">Status</th>
                  <th className="py-2 pr-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3b494b] text-[#dae2fd]">
                {attackingIps.map((ip) => {
                  const isBlocked = ip.status === 'blocked';
                  return (
                    <tr
                      key={ip.ip}
                      className="hover:bg-[#2d3449] transition-colors cursor-pointer group"
                      onClick={() => onInvestigateIp(ip)}
                    >
                      <td className="py-2 pl-2 font-bold text-[#00dbe9]">
                        {ip.ip}
                      </td>
                      <td className="py-2 text-[#849495] text-[11px]">
                        {ip.countryCode} ({ip.country})
                      </td>
                      <td className="py-2">
                        <span className={`text-[10px] font-bold ${
                          ip.riskScore >= 90 ? 'text-[#ffb4ab]' : ip.riskScore >= 70 ? 'text-[#ffe179]' : 'text-[#00dbe9]'
                        }`}>
                          {ip.riskScore}/100
                        </span>
                      </td>
                      <td className="py-2 text-[#dae2fd] text-[11px]">
                        {ip.attackType}
                      </td>
                      <td className="py-2">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                          isBlocked
                            ? 'bg-[#ffb4ab]/10 text-[#ffb4ab] border-[#ffb4ab]/30'
                            : 'bg-[#0b1326] text-[#00dbe9] border-[#00dbe9]/30'
                        }`}>
                          {isBlocked ? 'BLOCKED' : 'MONITORED'}
                        </span>
                      </td>
                      <td className="py-2 pr-2 text-right" onClick={(e) => e.stopPropagation()}>
                        {isBlocked ? (
                          <button
                            onClick={() => onUnblockIp(ip.ip)}
                            className="px-2 py-0.5 border border-[#3b494b] text-[#849495] hover:text-[#00dbe9] rounded text-[10px] transition-colors"
                          >
                            Unban
                          </button>
                        ) : (
                          <button
                            onClick={() => onBlockIp(ip.ip)}
                            className="px-2 py-0.5 bg-[#ffb4ab]/10 border border-[#ffb4ab]/40 text-[#ffb4ab] rounded text-[10px] hover:bg-[#ffb4ab]/20 transition-colors"
                          >
                            Quarantine
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Manual Quarantine & Top Targeted Assets */}
        <div className="space-y-4 font-mono">
          {/* Manual Quarantine Form */}
          <div className="p-4 bg-[#171f33] border border-[#3b494b] rounded space-y-3">
            <h3 className="font-mono text-xs font-bold text-[#dae2fd] uppercase border-b border-[#3b494b] pb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#ffb4ab] text-[16px]">lock</span>
              <span>Manual Firewall Quarantine</span>
            </h3>

            <form onSubmit={handleAddManualBlock} className="space-y-2.5 font-mono text-xs">
              <div>
                <label className="text-[10px] text-[#849495] uppercase">IP Address / CIDR:</label>
                <input
                  type="text"
                  value={newBlockIp}
                  onChange={(e) => setNewBlockIp(e.target.value)}
                  placeholder="e.g. 198.51.100.42"
                  className="w-full bg-[#0b1326] border border-[#3b494b] rounded p-2 text-xs text-[#dae2fd] mt-1 focus:outline-none focus:border-[#ffb4ab]"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#849495] uppercase">Quarantine Reason:</label>
                <input
                  type="text"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="w-full bg-[#0b1326] border border-[#3b494b] rounded p-2 text-xs text-[#dae2fd] mt-1 focus:outline-none focus:border-[#00dbe9]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-[#93000a] hover:bg-[#ffb4ab] hover:text-[#690005] text-[#ffb4ab] font-bold rounded text-xs transition-colors"
              >
                Apply Firewall Drop Rule
              </button>
            </form>
          </div>

          {/* Top Targeted Endpoints */}
          <div className="p-4 bg-[#171f33] border border-[#3b494b] rounded space-y-2">
            <h3 className="font-mono text-xs font-bold text-[#dae2fd] uppercase border-b border-[#3b494b] pb-2">
              Top Targeted Endpoints
            </h3>
            <div className="space-y-1.5 font-mono text-xs">
              {[
                { path: '/admin/login', count: 4291, percent: '38%' },
                { path: '/.env', count: 2105, percent: '22%' },
                { path: '/api/v2/catalog', count: 842, percent: '14%' },
                { path: '/wp-login.php', count: 620, percent: '9%' }
              ].map((item) => (
                <div key={item.path} className="flex justify-between items-center p-1.5 rounded bg-[#0b1326] border border-[#3b494b]">
                  <span className="text-[#ffe179]">{item.path}</span>
                  <div className="text-right">
                    <span className="text-[#dae2fd] font-bold">{item.count}</span>
                    <span className="text-[#849495] text-[10px] ml-1">({item.percent})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
