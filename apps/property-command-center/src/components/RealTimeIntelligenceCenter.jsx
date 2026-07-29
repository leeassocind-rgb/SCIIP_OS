import React from 'react';
import { createRealTimeRuntime } from '../real-time-intelligence/realTimeRuntime.js';

const CAPABILITIES = [
  ['Event Streaming', 'eventStreaming'],
  ['Digital Twin Sync', 'digitalTwinSynchronization'],
  ['Market Correlation', 'marketCorrelation'],
  ['Alerting', 'alerting'],
  ['Timeline Replay', 'timelineReplay'],
  ['Evidence Lineage', 'evidenceLineage'],
];

export default function RealTimeIntelligenceCenter() {
  const runtime = createRealTimeRuntime();

  return (
    <section className="rti-center" aria-labelledby="real-time-intelligence-title">
      <header>
        <p className="eyebrow">Release 5 · Batch 3</p>
        <h2 id="real-time-intelligence-title">Real-Time Intelligence</h2>
        <span className="status">{runtime.applicationStatus}</span>
      </header>

      <div className="rti-grid">
        {CAPABILITIES.map(([label, key]) => (
          <article key={key}>
            <small>{label}</small>
            <strong>{runtime[key]}</strong>
          </article>
        ))}
      </div>

      <aside>
        Broker approval is required for consequential actions. Autonomous consequential actions remain blocked.
      </aside>
    </section>
  );
}
