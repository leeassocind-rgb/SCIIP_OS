import React from 'react';
import { ArrowRight, BriefcaseBusiness, CheckCircle2, Sparkles } from 'lucide-react';

export default function ProductHome({ onNavigate }) {
  return (
    <section className="product-page">
      <header className="product-hero">
        <p className="sciip-kicker">SCIIP Executive Dashboard</p>
        <h1>Your market. Your work. Today.</h1>
        <p>
          SCIIP turns the latest SuperSheet changes into priorities, affected assignments,
          and evidence-backed next actions.
        </p>
      </header>

      <div className="product-two-column">
        <main>
          <section className="product-section">
            <header>
              <div>
                <p className="sciip-kicker">Today</p>
                <h2>Highest-value work</h2>
              </div>
              <button type="button" onClick={() => onNavigate('Morning Brief')}>Open Morning Brief</button>
            </header>
            <div className="product-list">
              {[
                ['Review Brookfield pricing', 'Competition changed after the latest SuperSheet'],
                ['Prepare South Bay client update', 'Two new comparables affect positioning'],
                ['Update Merola shortlist', 'New high-power requirement changed matches']
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
                <p className="sciip-kicker">Active assignments</p>
                <h2>Where market change affects current work</h2>
              </div>
            </header>
            <div className="product-list">
              {['Lowell Logistics Center','Brookfield Industrial','Merola Tile Requirement'].map(title => (
                <article className="product-row" key={title}>
                  <div className="product-row__icon"><BriefcaseBusiness size={14} /></div>
                  <div><strong>{title}</strong><span>Updated by latest market delta</span></div>
                  <ArrowRight size={16} />
                </article>
              ))}
            </div>
          </section>
        </main>

        <aside>
          <section className="product-section">
            <header><div><p className="sciip-kicker">Market status</p><h2>Since yesterday</h2></div></header>
            <div className="product-list">
              {[
                ['4 properties changed','Current'],
                ['2 comparables added','Current'],
                ['3 assignments impacted','Review'],
                ['3 recommendations generated','Ready']
              ].map(([title,status]) => (
                <article className="product-row" key={title}>
                  <div className="product-row__icon"><CheckCircle2 size={14} /></div>
                  <div><strong>{title}</strong><span>{status}</span></div>
                </article>
              ))}
            </div>
          </section>

          <section className="product-section">
            <header><div><p className="sciip-kicker">Copilot</p><h2>Ask what changed</h2></div></header>
            <div style={{ padding: 20 }}>
              <Sparkles size={22} />
              <p>Ask SCIIP about a property, assignment, market change, comparable, relationship, or recommendation.</p>
              <button type="button" onClick={() => onNavigate('Copilot')}>Open Copilot</button>
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}
