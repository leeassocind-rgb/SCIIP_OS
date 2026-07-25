# SCIIP_OS v7.0 Mobile UI Alpha

Adds a touch-first mobile presentation layer for the SCIIP Desktop shell and all six workspaces.

## Features

- bottom-tab workspace navigation
- compact sticky header
- minimum 44px touch targets
- safe-area handling
- responsive single-column layouts
- keyboard and focus support
- reduced-motion support
- loading, error, empty, offline, and ready states
- mobile certification

No processors are added.

## Install

```bash
cd ~/Downloads
unzip -o SCIIP_OS_v7_0_Mobile_UI_Alpha.zip
./SCIIP_OS_v7_0_Mobile_UI_Alpha/APPLY_V7_0_MOBILE_UI_ALPHA.command
```

## Deploy

```bash
cd ~/Desktop/SCIIP_OS
npm run deployment:push
```

## Apps Script test

```javascript
sciipTestMobileUiAlphaV7()
```
