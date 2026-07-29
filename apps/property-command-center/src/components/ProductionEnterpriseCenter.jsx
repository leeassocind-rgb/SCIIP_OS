import React from'react';
import{createProductionEnterpriseRuntime}from'../production-enterprise/productionRuntime.js';
const label=value=>String(value).replaceAll('_',' ');
export default function ProductionEnterpriseCenter(){
  const runtime=createProductionEnterpriseRuntime();
  const capabilities=[
    ['Governed Automation',runtime.automation,'Approval-gated workflows, durable queues, retries, and dead-letter handling.'],
    ['Enterprise Security',runtime.security,'Role-based permissions, session governance, and immutable audit history.'],
    ['Observability',runtime.observability,'Unified health, metrics, tracing, and capacity forecasting.'],
    ['Backup & Recovery',runtime.backupRecovery,'Verified backups, recovery planning, and destructive-action controls.'],
    ['Deployment Governance',runtime.deploymentGovernance,'Release gates across tests, build, security, recovery, and approval.'],
    ['Performance',runtime.performance,'Bundle, load, and query budgets validated before production promotion.']
  ];
  return <section className="production-enterprise-center" aria-labelledby="production-enterprise-title">
    <header className="production-enterprise-hero"><div><span className="production-enterprise-kicker">Release 5 · Production Enterprise Platform</span><h2 id="production-enterprise-title">Enterprise Production Center</h2><p>Governed operations, security, resiliency, deployment, and performance certification for SCIIP_OS.</p></div><div className={`production-health production-health-${runtime.health.status.toLowerCase()}`}><strong>{runtime.health.score}</strong><span>{label(runtime.health.status)}</span></div></header>
    <div className="production-enterprise-grid">{capabilities.map(([title,status,detail])=><article key={title}><div><span className="production-status-dot"/><small>{label(status)}</small></div><h3>{title}</h3><p>{detail}</p></article>)}</div>
    <section className="production-certification"><div><small>Application</small><strong>{runtime.applicationStatus}</strong></div><div><small>Version</small><strong>{runtime.applicationVersion}</strong></div><div><small>Release gate</small><strong>{runtime.deployment.status}</strong></div><div><small>Capacity</small><strong>{runtime.capacity}</strong></div></section>
    <aside className="production-governance-notice"><strong>Governance enforced</strong><span>Broker approval is required and autonomous consequential actions remain blocked.</span></aside>
  </section>;
}
