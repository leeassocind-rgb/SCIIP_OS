# SCIIP Product Realism Milestone 1

Introduces a single governed daily intelligence model consumed by Home, Morning Brief, and Assignments.

Objects:
- Evidence
- MarketSnapshot
- MarketEvent
- AssignmentImpact
- Recommendation
- BrokerReadiness
- DailyIntelligenceGraph

The included adapter uses a governed representative daily input fixture. The service boundary is designed so production SuperSheet ingestion can replace that adapter without changing the broker UI contract.
