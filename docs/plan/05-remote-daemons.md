# Phase 5: Remote Daemons and Encrypted Relay

## Outcome

Use one daemon protocol for multiple registered local and remote daemons through direct and encrypted relay routes.

## Dependencies

Complete Phase 4. Use [`../architecture/protocol.md`](../architecture/protocol.md), [`../product/clients.md`](../product/clients.md), [`../operations.md`](../operations.md), and [`../testing.md`](../testing.md).

## Phase boundaries

This phase owns saved daemon identities, explicit selection, direct authentication, relay pairing and encryption, route recovery for one daemon ID, and cross-daemon isolation.

This phase does not merge, replicate, redirect, or fall back across daemon IDs. It does not add a graphical daemon manager.

## Required outcomes

- A client can register localhost and multiple remote daemon identities, remove and restore localhost, and select one daemon for each action.
- An unavailable selected daemon stays selected and disconnected. No action executes elsewhere.
- Direct routes enforce retained password authentication, Host-header protection, and documented trusted-network requirements.
- Relay routes remain disabled until consent and preserve public-key trust, authenticated encryption, frame kind, tamper rejection, and daemon identity.
- Multiple routes can identify one daemon without creating cross-daemon authority.
- Two-daemon, direct-route, relay, built-CLI, and TUI acceptance tests prove isolation and no fallback.

## Exit condition

A client can register and use multiple daemons. Direct and relay routes preserve one daemon identity, and route failure never causes work to execute on another daemon.
