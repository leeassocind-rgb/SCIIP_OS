# SCIIP Explorer 2.0 Map Platform

Explorer uses a provider-neutral map contract. `GoogleMapsAdapter` is the production default. `MapboxAdapter` and `EsriAdapter` are registered extension ports so product code does not couple directly to a vendor SDK.

## Configuration

Copy `.env.example` to `.env.local` and set a browser-restricted Google Maps JavaScript API key:

```bash
VITE_MAP_PROVIDER=google
VITE_GOOGLE_MAPS_API_KEY=...
```

Restrict the key by approved HTTP referrers and enable only the APIs used by the deployed environment. The current foundation uses Maps JavaScript and native Street View controls. Directions, Places, drawing, drive-time, and data-layer services should be activated as separately governed capabilities.

## Contract

All providers implement `MapProvider`: initialize, property rendering, selected-property focus, spotlight radius, neighbor relationships, map type, resize, and destroy. Explorer components consume `ExplorerMap` and never import a vendor SDK directly.
