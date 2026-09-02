import React, { useState } from 'react';
import { KpiRow } from './KpiRow';
import { EventTimelineChart } from './EventTimelineChart';
import { AlertSeverityDiamond } from './AlertSeverityDiamond';
import { TopAttackingIpsTable } from './TopAttackingIpsTable';
import { GlobalThreatMap } from './GlobalThreatMap';
import { LiveAlertsTable } from './LiveAlertsTable';
import {
  SiemMetrics,
  SecurityAlert,
  AttackingIP,
  ThreatGeoNode,
  SeverityLevel
} from '../types';

interface DashboardProps {
  metrics: SiemMetrics;
  alerts: SecurityAlert[];
  attackingIps: AttackingIP[];
  geoNodes: ThreatGeoNode[];
  onSelectAlert: (alert: SecurityAlert) => void;
  onInvestigateIp: (ipData: AttackingIP) => void;
  onBlockIp: (ip: string) => void;
  onOpenFilterModal: () => void;
  filterSeverity: SeverityLevel | 'all';
  setFilterSeverity: (sev: SeverityLevel | 'all') => void;
  searchQuery: string;
}

export const Dashboard: React.FC<DashboardProps> = ({
  metrics,
  alerts,
  attackingIps,
  geoNodes,
  onSelectAlert,
  onInvestigateIp,
  onBlockIp,
  onOpenFilterModal,
  filterSeverity,
  setFilterSeverity,
  searchQuery
}) => {
  const [selectedKpiFilter, setSelectedKpiFilter] = useState<string>('all');

  // Filter alerts by search query, severity, and status
  const displayedAlerts = alerts.filter((alert) => {
    if (filterSeverity !== 'all' && alert.severity !== filterSeverity) return false;
    if (selectedKpiFilter === 'active_alerts' && alert.status === 'auto-closed') return false;
    if (selectedKpiFilter === 'critical' && alert.severity !== 'critical') return false;
    if (selectedKpiFilter === 'blocked' && !alert.blocked) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        alert.sourceIp.toLowerCase().includes(q) ||
        alert.eventType.toLowerCase().includes(q) ||
        alert.description.toLowerCase().includes(q) ||
        alert.ruleTriggered.toLowerCase().includes(q) ||
        alert.country.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;
  const highCount = alerts.filter((a) => a.severity === 'high').length;
  const mediumCount = alerts.filter((a) => a.severity === 'medium').length;

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto pb-12">
      {/* 1. Metric Cards Row */}
      <KpiRow
        metrics={metrics}
        onFilterChange={(filter) => {
          setSelectedKpiFilter(filter);
          if (filter === 'critical') setFilterSeverity('critical');
          if (filter === 'all') setFilterSeverity('all');
        }}
      />

      {/* 2. Middle Row: Event Timeline Chart (2 cols) & Alert Severity Gauge (1 col) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <EventTimelineChart
          onPointClick={(pointInfo) => {
            console.log('Timeline point clicked:', pointInfo);
          }}
        />
        <AlertSeverityDiamond
          criticalCount={criticalCount}
          highCount={highCount}
          mediumCount={mediumCount}
          selectedSeverity={filterSeverity}
          onSelectSeverity={(sev) => setFilterSeverity(sev)}
        />
      </section>

      {/* 3. Lower Row: Live Alerts Stream (2 cols) & Side Threat Grid (1 col) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <LiveAlertsTable
            alerts={displayedAlerts}
            onSelectAlert={onSelectAlert}
            onOpenFilter={onOpenFilterModal}
            filterSeverity={filterSeverity}
          />
        </div>

        <div className="flex flex-col gap-4">
          <TopAttackingIpsTable
            ips={attackingIps}
            onInvestigate={onInvestigateIp}
            onBlockIp={onBlockIp}
          />
          <GlobalThreatMap
            nodes={geoNodes}
            onInvestigateIp={(ipStr) => {
              const found = attackingIps.find((ip) => ip.ip === ipStr);
              if (found) {
                onInvestigateIp(found);
              } else {
                onInvestigateIp({
                  ip: ipStr,
                  country: 'Unknown Target',
                  countryCode: 'XX',
                  count: 120,
                  attackType: 'Reconnaissance',
                  riskScore: 80,
                  status: 'active'
                });
              }
            }}
          />
        </div>
      </section>
    </div>
  );
};
