import React from 'react';
import { CheckCircle2, Search, Sparkles } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Skeleton,
  TextField
} from '../design-system/components/index.js';
import { Cluster, Page, Stack } from '../design-system/layout/index.js';
import '../design-system/tokens/tokens.css';
import '../design-system/styles/foundations.css';
import '../design-system/styles/components.css';

export default function Phase19DesignSystemGallery() {
  return (
    <Page>
      <Stack gap="var(--sciip-space-8)">
        <header>
          <p className="sciip-kicker">Phase 19 · Design System v1</p>
          <h1 className="sciip-title">SCIIP Design System Foundations</h1>
          <p className="sciip-subtitle">
            Governed tokens, reusable components, accessibility standards,
            and consistent interaction patterns for every daily workflow.
          </p>
        </header>

        <Card
          title="Buttons and status"
          meta="Primary actions, secondary actions, and governed state indicators"
        >
          <Cluster>
            <Button><Sparkles size={16} /> Ask SCIIP</Button>
            <Button variant="secondary"><Search size={16} /> Search</Button>
            <Button variant="ghost">View evidence</Button>
            <Badge tone="success">Operational</Badge>
            <Badge tone="warning">Review required</Badge>
            <Badge tone="danger">Blocked</Badge>
          </Cluster>
        </Card>

        <Card
          title="Form controls"
          meta="Accessible labels, descriptions, and validation messaging"
        >
          <div style={{ maxWidth: 480 }}>
            <TextField
              label="Search assignments"
              placeholder="Address, client, company, market…"
              description="Search across governed assignment context."
            />
          </div>
        </Card>

        <Card
          title="Loading and empty states"
          meta="Consistent feedback during long-running operations"
        >
          <Stack>
            <Skeleton height={18} width="55%" />
            <Skeleton height={14} width="90%" />
            <Skeleton height={14} width="72%" />
            <EmptyState
              icon={<CheckCircle2 size={22} />}
              title="No unresolved items"
              description="All governed review items are currently resolved."
              action={<Button variant="secondary">View recent activity</Button>}
            />
          </Stack>
        </Card>
      </Stack>
    </Page>
  );
}
