import React from 'react';
import { ArrowRight, Building2, FileText, HeartHandshake, Sparkles, TrendingUp, Users } from 'lucide-react';
import Badge from '../design-system/components/Badge.jsx';

const boxes = Object.freeze([
  { icon: Building2, title: 'Properties changed', count: 4, detail: 'Availability, asking rate, power, and status updates', tone: 'info' },
  { icon: FileText, title: 'New comparables', count: 2, detail: 'One South Bay lease and one Inland Empire sale', tone: 'success' },
  { icon: Users, title: 'Requirements', count: 1, detail: 'New 4,000 amp aerospace requirement', tone: 'warning' },
  { icon: Sparkles, title: 'Assignments impacted', count: 3, detail: 'Lowell, Brookfield, and Merola require review', tone: 'warning' },
  { icon: HeartHandshake, title: 'Relationships', count: 2, detail: 'One ownership link and one follow-up window', tone: 'info' },
  { icon: TrendingUp, title: 'Recommended actions', count: 3, detail: 'Pricing, shortlist, and client brief updates', tone: 'success' }
]);

export default function ProductMorningBrief() {
  return (
    <section className="product-page">
      <header className="product-hero">
        <p className="sciip-kicker">Today’s Morning Brief</p>
        <h1>What changed since yesterday.</h1>
        <p>
          Since yesterday, four properties changed, two comparables were added,
          one new high-power requirement entered the market, and three active
          assignments were affected.
        </p>
      </header>

      <section className="product-grid-3" aria-label="Morning brief changes">
        {boxes.map(({ icon: Icon, title, count, detail, tone }) => (
          <article className="product-info-card" key={title}>
            <Icon size={19} />
            <span>{title}</span>
            <strong>{count}</strong>
            <small>{detail}</small>
            <div style={{ marginTop: 12 }}>
              <Badge tone={tone}>Review change</Badge>
            </div>
          </article>
        ))}
      </section>

      <div className="product-two-column" style={{ marginTop: 24 }}>
        <section className="product-section">
          <header>
            <div>
              <p className="sciip-kicker">Market impact</p>
              <h2>What matters to active assignments</h2>
            </div>
          </header>
          <div className="product-list">
            {[
              ['Lowell Logistics Center', 'New comparable evidence supports a pricing review'],
              ['Brookfield Industrial', 'Competition changed after an asking-rate reduction'],
              ['Merola Tile Requirement', 'Two properties now match the power requirement']
            ].map(([title, detail], index) => (
              <article className="product-row" key={title}>
                <div className="product-row__icon">{index + 1}</div>
                <div><strong>{title}</strong><span>{detail}</span></div>
                <ArrowRight size={16} />
              </article>
            ))}
          </div>
        </section>

        <section className="product-section">
          <header>
            <div>
              <p className="sciip-kicker">Broker actions</p>
              <h2>What to do next</h2>
            </div>
          </header>
          <div className="product-list">
            {[
              ['Review Brookfield pricing', 'Evidence linked'],
              ['Refresh South Bay brief', 'Evidence linked'],
              ['Update Merola shortlist', 'Evidence linked']
            ].map(([title, detail]) => (
              <article className="product-row" key={title}>
                <div className="product-row__icon"><Sparkles size={14} /></div>
                <div><strong>{title}</strong><span>{detail}</span></div>
                <ArrowRight size={16} />
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
