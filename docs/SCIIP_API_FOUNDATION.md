# SCIIP_OS API Foundation

SCIIP_OS exposes a versioned Apps Script web-app boundary through `doGet` and `doPost`.

## Routing

Clients provide the route through the `path` query parameter. Public foundation routes are `GET /health` and `GET /version`. `GET /routes` is protected.

## Authentication

Authentication is injected through `SCIIP_API.setAuthProvider(fn)`. Protected routes fail closed while no provider is configured. The API foundation does not embed secrets or invent an identity system.

## Response contract

Every response contains `apiVersion`, `status`, `requestId`, `timestamp`, `data`, `error`, and `httpStatus`.

## Extension rule

New API capabilities register handlers through `SCIIP_API.register(method, path, handler, options)`. Handlers receive the request, principal, and service boundary. They must not access storage implementations directly.
