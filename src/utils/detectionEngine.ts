import { LogEvent, SecurityAlert, DetectionRule, SeverityLevel } from '../types';

// IP to Geo/Country mapper for synthetic simulation
export function getGeoForIp(ip: string): { country: string; countryCode: string; lat: number; lng: number } {
  if (ip.startsWith('185.17.') || ip.startsWith('95.173.')) {
    return { country: 'Russia', countryCode: 'RU', lat: 55.7558, lng: 37.6173 };
  }
  if (ip.startsWith('45.22.') || ip.startsWith('114.119.')) {
    return { country: 'China', countryCode: 'CN', lat: 31.2304, lng: 121.4737 };
  }
  if (ip.startsWith('91.200.') || ip.startsWith('177.12.')) {
    return { country: 'Brazil', countryCode: 'BR', lat: -23.5505, lng: -46.6333 };
  }
  if (ip.startsWith('194.26.') || ip.startsWith('88.198.')) {
    return { country: 'Germany', countryCode: 'DE', lat: 50.1109, lng: 8.6821 };
  }
  if (ip.startsWith('103.245.') || ip.startsWith('113.161.')) {
    return { country: 'Vietnam', countryCode: 'VN', lat: 21.0285, lng: 105.8542 };
  }
  if (ip.startsWith('10.') || ip.startsWith('192.168.') || ip.startsWith('172.16.')) {
    return { country: 'Internal Network', countryCode: 'LAN', lat: 37.7749, lng: -122.4194 };
  }
  return { country: 'United States', countryCode: 'US', lat: 38.8951, lng: -77.0364 };
}

// Grok / Regex log parser for standard log lines (Apache/Nginx, Linux auth.log, Firewall)
export function parseRawLogLine(line: string): Partial<LogEvent> {
  const trimmed = line.trim();
  if (!trimmed) return {};

  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

  // 1. Apache / Nginx Combined Log Format
  // Example: 185.17.43.99 - - [27/Oct/2023:14:32:01 +0000] "POST /admin/login HTTP/1.1" 401 532 "ref" "Agent"
  const webRegex = /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\s+-\s+-\s+\[(.*?)\]\s+"([A-Z]+)\s+([^\s]+)\s+HTTP\/[0-9.]+"\s+(\d{3})\s+(\d+|-)(?:\s+"([^"]*)"\s+"([^"]*)")?/;
  const webMatch = trimmed.match(webRegex);
  if (webMatch) {
    const sourceIp = webMatch[1];
    const method = webMatch[3];
    const endpoint = webMatch[4];
    const statusCode = parseInt(webMatch[5], 10);
    const bytes = webMatch[6] !== '-' ? parseInt(webMatch[6], 10) : 0;
    const userAgent = webMatch[8] || 'Unknown Web Client';
    const geo = getGeoForIp(sourceIp);

    return {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: nowStr,
      sourceIp,
      destinationIp: '10.0.1.80',
      method,
      endpoint,
      statusCode,
      userAgent,
      bytes,
      rawMessage: trimmed,
      logType: 'nginx',
      country: geo.country,
      countryCode: geo.countryCode,
      isAnomaly: statusCode >= 400 || endpoint.includes('admin') || endpoint.includes('.env')
    };
  }

  // 2. Linux auth.log / SSH format
  // Example: Oct 27 14:32:01 gateway sshd[1942]: Failed password for root from 185.17.43.99 port 52210 ssh2
  const authRegex = /sshd\[\d+\]:\s+(Failed|Accepted|Invalid)\s+password\s+(?:for\s+(\w+)\s+)?from\s+(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/;
  const authMatch = trimmed.match(authRegex);
  if (authMatch) {
    const authResult = authMatch[1];
    const username = authMatch[2] || 'root';
    const sourceIp = authMatch[3];
    const isFailed = authResult.toLowerCase().includes('fail') || authResult.toLowerCase().includes('invalid');
    const geo = getGeoForIp(sourceIp);

    return {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: nowStr,
      sourceIp,
      destinationIp: '10.0.1.22',
      method: 'SSH_AUTH',
      endpoint: `port:22 user:${username}`,
      statusCode: isFailed ? 401 : 200,
      userAgent: 'OpenSSH_8.4',
      rawMessage: trimmed,
      logType: 'auth',
      country: geo.country,
      countryCode: geo.countryCode,
      isAnomaly: isFailed,
      attackType: isFailed ? 'Failed SSH Login' : undefined
    };
  }

  // 3. Firewall / IPTables format
  // Example: Oct 27 14:30:12 perimeter-gw iptables: [SYN_FLOOD_DROP] IN=eth0 SRC=45.22.19.112 DST=198.51.100.2 PROTO=TCP DPT=3389
  const fwRegex = /SRC=(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\s+DST=(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}).*?PROTO=(\w+)(?:\s+DPT=(\d+))?/;
  const fwMatch = trimmed.match(fwRegex);
  if (fwMatch) {
    const sourceIp = fwMatch[1];
    const destinationIp = fwMatch[2];
    const method = `FW_${fwMatch[3]}`;
    const endpoint = fwMatch[4] ? `:${fwMatch[4]}` : 'ANY';
    const geo = getGeoForIp(sourceIp);

    return {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: nowStr,
      sourceIp,
      destinationIp,
      method,
      endpoint,
      statusCode: 444,
      rawMessage: trimmed,
      logType: 'firewall',
      country: geo.country,
      countryCode: geo.countryCode,
      isAnomaly: true,
      attackType: 'Firewall Dropped Packet'
    };
  }

  // Fallback generic parsing
  const ipExtract = trimmed.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/);
  const ip = ipExtract ? ipExtract[0] : '192.168.1.50';
  const geo = getGeoForIp(ip);

  return {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: nowStr,
    sourceIp: ip,
    destinationIp: '10.0.0.1',
    rawMessage: trimmed,
    logType: 'syslog',
    country: geo.country,
    countryCode: geo.countryCode,
    isAnomaly: trimmed.toLowerCase().includes('error') || trimmed.toLowerCase().includes('drop') || trimmed.toLowerCase().includes('fail')
  };
}

// Sliding window detection engine
export function evaluateDetectionRules(
  recentLogs: LogEvent[],
  rules: DetectionRule[]
): SecurityAlert[] {
  const newAlerts: SecurityAlert[] = [];
  const now = Date.now();

  for (const rule of rules) {
    if (!rule.enabled) continue;

    if (rule.ruleType === 'brute_force') {
      // Group by IP and count failed logins in window
      const ipFailCounts: Record<string, { count: number; lastLog: LogEvent }> = {};
      const windowSec = rule.windowSeconds || 60;
      const threshold = rule.threshold || 5;

      for (const log of recentLogs) {
        const isFailed = log.statusCode === 401 || (log.attackType && log.attackType.includes('Failed'));
        if (isFailed) {
          if (!ipFailCounts[log.sourceIp]) {
            ipFailCounts[log.sourceIp] = { count: 0, lastLog: log };
          }
          ipFailCounts[log.sourceIp].count++;
        }
      }

      for (const [ip, data] of Object.entries(ipFailCounts)) {
        if (data.count >= threshold) {
          newAlerts.push({
            id: `ALT-${Math.floor(1000 + Math.random() * 9000)}`,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            severity: rule.severity,
            sourceIp: ip,
            eventType: 'Multiple Failed Logins (Brute Force Storm)',
            status: 'open',
            description: `Exceeded threshold of ${threshold} failed attempts within ${windowSec}s window (${data.count} occurrences detected).`,
            relatedEventsCount: data.count,
            country: data.lastLog.country,
            countryCode: data.lastLog.countryCode,
            ruleTriggered: `${rule.id}: ${rule.name}`,
            rawLogSample: data.lastLog.rawMessage,
            analystNotes: 'Auto-correlated by sliding window aggregation engine.',
            blocked: false
          });
        }
      }
    }

    if (rule.ruleType === 'sensitive_path') {
      const sensitiveRegex = /(\.(env|git|aws|ssh)|wp-login|actuator|xmlrpc|phpmyadmin|config\.json|admin\/auth)/i;
      for (const log of recentLogs) {
        if (log.endpoint && sensitiveRegex.test(log.endpoint)) {
          newAlerts.push({
            id: `ALT-${Math.floor(1000 + Math.random() * 9000)}`,
            timestamp: log.timestamp,
            severity: rule.severity,
            sourceIp: log.sourceIp,
            eventType: `Sensitive Path Discovery (${log.endpoint.split('?')[0]})`,
            status: 'open',
            description: `Automated reconnaissance probe targeting sensitive administrative path ${log.endpoint}.`,
            relatedEventsCount: 1,
            country: log.country,
            countryCode: log.countryCode,
            ruleTriggered: `${rule.id}: ${rule.name}`,
            rawLogSample: log.rawMessage,
            analystNotes: 'Target endpoint does not exist or was rejected by perimeter policy.',
            blocked: false
          });
        }
      }
    }

    if (rule.ruleType === 'sqli_xss') {
      const sqliRegex = /(union\s+select|1=1|--|;\s*drop|exec\(|<script|javascript:)/i;
      for (const log of recentLogs) {
        const textToSearch = `${log.endpoint || ''} ${log.rawMessage}`;
        if (sqliRegex.test(textToSearch)) {
          newAlerts.push({
            id: `ALT-${Math.floor(1000 + Math.random() * 9000)}`,
            timestamp: log.timestamp,
            severity: rule.severity,
            sourceIp: log.sourceIp,
            eventType: 'SQL Injection / Web Exploit Payload',
            status: 'open',
            description: 'Detected SQL meta-characters or script tags in HTTP request line.',
            relatedEventsCount: 1,
            country: log.country,
            countryCode: log.countryCode,
            ruleTriggered: `${rule.id}: ${rule.name}`,
            rawLogSample: log.rawMessage,
            analystNotes: 'Immediate WAF block recommended if repetitive.',
            blocked: false
          });
        }
      }
    }
  }

  return newAlerts;
}

// Synthetic attack generator
export function generateSyntheticAttackBatch(scenarioId: string): { logs: LogEvent[]; alerts: SecurityAlert[] } {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

  if (scenarioId === 'attack_ssh_brute') {
    const logs: LogEvent[] = Array.from({ length: 8 }).map((_, i) => ({
      id: `gen-${Date.now()}-${i}`,
      timestamp,
      sourceIp: '185.17.43.99',
      destinationIp: '10.0.1.22',
      method: 'SSH_AUTH',
      endpoint: `port:22 user:admin_${i}`,
      statusCode: 401,
      userAgent: 'Hydra SSH v9.4',
      rawMessage: `Oct 27 14:35:${10 + i} gateway sshd[${2000 + i}]: Failed password for admin_${i} from 185.17.43.99 port ${42000 + i} ssh2`,
      logType: 'auth',
      country: 'Russia',
      countryCode: 'RU',
      isAnomaly: true,
      attackType: 'SSH Brute Force'
    }));

    const alert: SecurityAlert = {
      id: `ALT-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp,
      severity: 'critical',
      sourceIp: '185.17.43.99',
      eventType: 'Multiple Failed Logins (SSH Storm)',
      status: 'open',
      description: 'Triggered by high rate of SSH login failures (>8 attempts in 5 seconds).',
      relatedEventsCount: 8,
      country: 'Russia',
      countryCode: 'RU',
      ruleTriggered: 'RULE-BF-01: Admin Brute Force Storm',
      rawLogSample: logs[0].rawMessage,
      analystNotes: 'Simulated brute force surge injected.',
      blocked: false
    };

    return { logs, alerts: [alert] };
  }

  if (scenarioId === 'attack_sqli_wave') {
    const logs: LogEvent[] = Array.from({ length: 5 }).map((_, i) => ({
      id: `gen-${Date.now()}-${i}`,
      timestamp,
      sourceIp: '91.200.12.5',
      destinationIp: '10.0.1.80',
      method: 'GET',
      endpoint: `/api/v2/catalog?id=-1%20UNION%20SELECT%20null,${i},schema_name%20FROM%20information_schema.schemata--`,
      statusCode: 403,
      userAgent: 'sqlmap/1.6.12',
      rawMessage: `91.200.12.5 - - [${timestamp}] "GET /api/v2/catalog?id=-1%20UNION%20SELECT%20null,${i},schema_name%20FROM%20information_schema.schemata-- HTTP/1.1" 403 280 "-" "sqlmap/1.6"`,
      logType: 'apache',
      country: 'Brazil',
      countryCode: 'BR',
      isAnomaly: true,
      attackType: 'SQL Injection'
    }));

    const alert: SecurityAlert = {
      id: `ALT-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp,
      severity: 'critical',
      sourceIp: '91.200.12.5',
      eventType: 'SQL Injection Attack (Schema Dump Attempt)',
      status: 'open',
      description: 'Automated injection targeting backend PostgreSQL metadata tables.',
      relatedEventsCount: 5,
      country: 'Brazil',
      countryCode: 'BR',
      ruleTriggered: 'RULE-SQLI-03: SQL Injection & Command Metachars',
      rawLogSample: logs[0].rawMessage,
      analystNotes: 'Intercepted with 403 Forbidden.',
      blocked: false
    };

    return { logs, alerts: [alert] };
  }

  // Default port sweep
  const logs: LogEvent[] = Array.from({ length: 6 }).map((_, i) => ({
    id: `gen-${Date.now()}-${i}`,
    timestamp,
    sourceIp: '45.22.19.112',
    destinationIp: '198.51.100.2',
    method: 'TCP_SYN',
    endpoint: `:${[21, 22, 80, 443, 3389, 8080][i % 6]}`,
    statusCode: 444,
    userAgent: 'Nmap Scripting Engine',
    rawMessage: `Oct 27 14:36:${10 + i} perimeter-gw iptables: [SYN_FLOOD_DROP] IN=eth0 SRC=45.22.19.112 DST=198.51.100.2 PROTO=TCP DPT=${[21, 22, 80, 443, 3389, 8080][i % 6]} FLAGS=SYN`,
    logType: 'firewall',
    country: 'China',
    countryCode: 'CN',
    isAnomaly: true,
    attackType: 'Port Scan'
  }));

  const alert: SecurityAlert = {
    id: `ALT-${Math.floor(1000 + Math.random() * 9000)}`,
    timestamp,
    severity: 'high',
    sourceIp: '45.22.19.112',
    eventType: 'Rapid Port Sweep (External Perimeter)',
    status: 'open',
    description: 'Port sweep scanning sensitive administrative listening sockets.',
    relatedEventsCount: 6,
    country: 'China',
    countryCode: 'CN',
    ruleTriggered: 'RULE-SCAN-02: Rapid Port Sweep Anomaly',
    rawLogSample: logs[0].rawMessage,
    analystNotes: 'Packet drops logged by edge firewall.',
    blocked: false
  };

  return { logs, alerts: [alert] };
}
