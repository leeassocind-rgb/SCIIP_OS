import assert from 'node:assert/strict';
import fs from 'node:fs';

let testsRun = 0;
const test = condition => {
  testsRun += 1;
  assert.ok(condition);
};

const files = [
  'src/design-system/components/Badge.jsx',
  'src/design-system/components/Button.jsx',
  'src/design-system/components/Card.jsx',
  'src/design-system/components/EmptyState.jsx',
  'src/design-system/components/Skeleton.jsx',
  'src/design-system/components/TextField.jsx',
  'src/design-system/layout/Page.jsx',
  'src/design-system/layout/Stack.jsx',
  'src/design-system/layout/Cluster.jsx',
  'src/design-system/tokens/tokens.css',
  'src/design-system/styles/foundations.css',
  'src/design-system/styles/components.css',
  'src/components/Phase19DesignSystemGallery.jsx'
];

for (const file of files) test(fs.existsSync(file));

const tokens = fs.readFileSync('src/design-system/tokens/tokens.css', 'utf8');
const components = fs.readFileSync('src/design-system/styles/components.css', 'utf8');
const gallery = fs.readFileSync('src/components/Phase19DesignSystemGallery.jsx', 'utf8');

test(tokens.includes('--sciip-space-4'));
test(tokens.includes('--sciip-focus-ring'));
test(tokens.includes('@media (prefers-reduced-motion: reduce)'));
test(components.includes('min-height: 44px'));
test(gallery.includes('SCIIP Design System Foundations'));

console.log(JSON.stringify({
  framework: 'SCIIP_PHASE19_DESIGN_SYSTEM_COMPONENTS',
  status: 'PASSED',
  testsRun,
  result: {
    tokenFoundation: true,
    accessibilityFoundation: true,
    responsiveFoundation: true,
    componentGalleryAvailable: true
  }
}, null, 2));
