import React, { useState } from 'react';
import { LogEvent, LogType } from '../types';

interface LogStreamViewProps {
  logs: LogEvent[];
  onInvestigateIp: (ip: string) => void;
  onClearLogs: () => void;
}

export const LogStreamView: React.FC<LogStreamViewProps> = ({
  logs,
  onInvestigateIp,
  onClearLogs
}) => {
  const [selectedType, setSelectedType] = useState<LogType | 'all'>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [filterText, setFilterText] = useState<string>('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const filteredLogs = logs.filter((log) => {
    if (selectedType !== 'all' && log.logType !== selectedType) return false;
    if (selectedStatusFilter === '4xx' && !(log.statusCode && log.statusCode >= 400 && log.statusCode < 500)) return false;
    if (selectedStatusFilter === '5xx' && !(log.statusCode && log.statusCode >= 500)) return false;
    if (selectedStatusFilter === '2xx' && !(log.statusCode && log.statusCode >= 200 && log.statusCode < 300)) return false;
    if (selectedStatusFilter === 'anomalies' && !log.isAnomaly) return false;

    if (filterText) {
      const q = filterText.toLowerCase();
      return (
        log.sourceIp.includes(q) ||
        log.destinationIp.includes(q) ||
        (log.endpoint && log.endpoint.toLowerCase().includes(q)) ||
        log.rawMessage.toLowerCase().includes(q) ||
        (log.userAgent && log.userAgent.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const exportCsv = () => {
    const headers = ['Timestamp', 'LogType', 'Source IP', 'Dest IP', 'Method', 'Endpoint', 'Status', 'Country', 'Anomaly', 'Raw'];
    const rows = filteredLogs.map((l) => [
      l.timestamp,
      l.logType,
      l.sourceIp,
      l.destinationIp,
      l.method || '',
      l.endpoint || '',
      l.statusCode || '',
      l.country,
      l.isAnomaly ? 'YES' : 'NO',
      `"${l.rawMessage.replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sentinel-logs-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 select-none">
      {/* Top Header Card */}
      <div className="p-4 bg-[#171f33] border border-[#3b494b] rounded flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00dbe9] text-[22px]">list_alt</span>
            <h2 className="font-mono text-base font-bold text-[#dae2fd]">
              Normalized Log Stream Explorer
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#2d3449] text-[#00dbe9] border border-[#3b494b]">
              {filteredLogs.length} Events Listed
            </span>
          </div>
          <p className="text-xs text-[#849495] font-mono mt-1">
            Real-time parser ingests Apache, Nginx, Linux SSH <code className="text-[#ffe179]">auth.log</code> and IPTables syslog.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={exportCsv}
            className="px-3 py-1.5 bg-[#2d3449] border border-[#3b494b] hover:border-[#00dbe9] text-xs font-mono text-[#dae2fd] rounded flex items-center gap-1.5 transition-all"
          >
            <span className="material-symbols-outlined text-[16px] text-[#00dbe9]">download</span>
            <span>Export CSV</span>
          </button>
          <button
            onClick={onClearLogs}
            className="px-3 py-1.5 bg-[#0b1326] border border-[#3b494b] hover:border-[#ffb4ab] text-xs font-mono text-[#849495] hover:text-[#ffb4ab] rounded transition-all"
          >
            Clear Stream
          </button>
        </div>
      </div>

      {/* Filter and Query Bar */}
      <div className="p-3 bg-[#171f33] border border-[#3b494b] rounded flex flex-col md:flex-row gap-3 items-center">
        {/* Search query input */}
        <div className="relative flex-1 w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#849495] text-[18px]">
            filter_alt
          </span>
          <input
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Search raw logs by IP, path, status, agent (e.g. 185.17, /admin, 401)..."
            className="w-full bg-[#0b1326] border border-[#3b494b] rounded text-xs font-mono py-2 pl-9 pr-3 text-[#dae2fd] placeholder:text-[#849495]/50 focus:outline-none focus:border-[#00dbe9]"
          />
        </div>

        {/* Log Type Tabs */}
        <div className="flex flex-wrap gap-1.5">
          {(['all', 'nginx', 'apache', 'auth', 'firewall', 'syslog'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono uppercase font-bold transition-all ${
                selectedType === type
                  ? 'bg-[#00dbe9]/20 border border-[#00dbe9] text-[#00dbe9]'
                  : 'bg-[#0b1326] border border-[#3b494b] text-[#849495] hover:text-[#dae2fd]'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Status quick chips */}
        <div className="flex gap-1">
          {[
            { id: 'all', label: 'All Status' },
            { id: 'anomalies', label: 'Anomalies Only' },
            { id: '4xx', label: '4xx Client Err' },
            { id: '5xx', label: '5xx Server Err' }
          ].map((chip) => (
            <button
              key={chip.id}
              onClick={() => setSelectedStatusFilter(chip.id)}
              className={`px-2 py-1 rounded text-[10px] font-mono transition-all ${
                selectedStatusFilter === chip.id
                  ? 'bg-[#2d3449] text-[#00dbe9] font-bold border border-[#00dbe9]/40'
                  : 'bg-[#0b1326] border border-[#3b494b] text-[#849495]'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Log Feed Table */}
      <div className="bg-[#171f33] rounded overflow-hidden border border-[#3b494b]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="bg-[#0b1326] border-b border-[#3b494b] text-[#849495] text-[10px] uppercase tracking-wider">
                <th className="py-2.5 pl-3">Timestamp</th>
                <th className="py-2.5">Source IP</th>
                <th className="py-2.5">Type</th>
                <th className="py-2.5">Method & Endpoint</th>
                <th className="py-2.5">Status</th>
                <th className="py-2.5 text-center">Country</th>
                <th className="py-2.5 pr-3 text-right">Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3b494b] text-[#dae2fd]">
              {filteredLogs.map((log) => {
                const isExpanded = expandedLogId === log.id;
                const statusColor =
                  log.statusCode && log.statusCode >= 500
                    ? 'text-[#ffb4ab] bg-[#ffb4ab]/10 border-[#ffb4ab]/30'
                    : log.statusCode && log.statusCode >= 400
                    ? 'text-[#ffe179] bg-[#ffe179]/10 border-[#ffe179]/30'
                    : 'text-[#00dbe9] bg-[#00dbe9]/10 border-[#00dbe9]/30';

                return (
                  <React.Fragment key={log.id}>
                    <tr
                      onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                      className={`hover:bg-[#2d3449]/70 cursor-pointer transition-colors ${
                        log.isAnomaly ? 'bg-[#ffb4ab]/5' : ''
                      }`}
                    >
                      <td className="py-2 pl-3 text-[#849495] text-[11px] whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="py-2 whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onInvestigateIp(log.sourceIp);
                          }}
                          className={`font-bold hover:underline ${
                            log.isAnomaly ? 'text-[#ffb4ab]' : 'text-[#00dbe9]'
                          }`}
                        >
                          {log.sourceIp}
                        </button>
                      </td>
                      <td className="py-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] uppercase bg-[#2d3449] border border-[#3b494b] text-[#849495]">
                          {log.logType}
                        </span>
                      </td>
                      <td className="py-2 max-w-xs truncate">
                        <span className="text-[#ffe179] font-bold mr-1.5">{log.method}</span>
                        <span className="text-[#dae2fd]">{log.endpoint || '-'}</span>
                      </td>
                      <td className="py-2">
                        {log.statusCode !== undefined ? (
                          <span className={`px-1.5 py-0.5 rounded text-[10px] border font-bold ${statusColor}`}>
                            {log.statusCode}
                          </span>
                        ) : (
                          <span className="text-[#849495]">-</span>
                        )}
                      </td>
                      <td className="py-2 text-center">
                        <span className="px-1.5 py-0.5 rounded bg-[#2d3449] border border-[#3b494b] text-[10px] text-[#849495]">
                          {log.countryCode}
                        </span>
                      </td>
                      <td className="py-2 pr-3 text-right">
                        <span className="material-symbols-outlined text-[16px] text-[#849495]">
                          {isExpanded ? 'expand_less' : 'expand_more'}
                        </span>
                      </td>
                    </tr>

                    {/* Expanded Details Row */}
                    {isExpanded && (
                      <tr className="bg-[#0b1326] text-xs">
                        <td colSpan={7} className="p-3 border-t border-b border-[#3b494b] space-y-2">
                          <div className="flex justify-between items-center text-[#849495] text-[11px]">
                            <span className="font-bold text-[#00dbe9]">RAW UNPROCESSED LOG ENTRY:</span>
                            <button
                              onClick={() => navigator.clipboard.writeText(log.rawMessage)}
                              className="hover:text-[#00dbe9] flex items-center gap-1 text-[10px]"
                            >
                              <span className="material-symbols-outlined text-[12px]">content_copy</span>
                              Copy Raw Log
                            </button>
                          </div>
                          <pre className="p-2 bg-[#171f33] rounded border border-[#3b494b] text-[11px] text-[#dae2fd] overflow-x-auto whitespace-pre-wrap select-text">
                            {log.rawMessage}
                          </pre>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] text-[#849495] pt-1 font-mono">
                            <div>Dest IP: <span className="text-[#dae2fd]">{log.destinationIp}</span></div>
                            <div>User-Agent: <span className="text-[#dae2fd] truncate block">{log.userAgent || 'N/A'}</span></div>
                            <div>Anomaly Tag: <span className={log.isAnomaly ? 'text-[#ffb4ab] font-bold' : 'text-[#00dbe9]'}>{log.attackType || (log.isAnomaly ? 'Yes' : 'Normal')}</span></div>
                            <div>Bytes: <span className="text-[#dae2fd]">{log.bytes ? `${log.bytes} B` : '-'}</span></div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
