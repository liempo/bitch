# Phase 4: CLI and TUI Workspace Canvas

## Outcome

Make the built CLI and TUI complete clients for approved local-daemon, Pi Conversation, Workspace, and Terminal workflows.

## Dependencies

Complete Phase 3. Use [`../docs/architecture/cli.md`](../docs/architecture/cli.md), [`../docs/product/clients.md`](../docs/product/clients.md), and [`../docs/testing.md`](../docs/testing.md).

## Phase boundaries

This phase owns retained CLI command families, local onboarding and daemon selection, and the BITCH terminal Workspace canvas. It presents daemon-owned state without creating a second client authority.

This phase does not deliver direct remote routes, relay pairing, graphical clients, or deferred Pi controls outside the retained Paseo boundary.

## Required outcomes

- The built CLI covers local daemon, Conversation, Workspace, Terminal, question, and selected-daemon operations with retained human and machine output behavior.
- Connection failure keeps the selected daemon and never falls back to another daemon.
- The TUI supports Workspace navigation, tabs, user-created splits, focus, layout persistence, Conversation panels, Terminal panels, and copied close semantics.
- The TUI renders normalized timelines, questions, controls, tools, diffs, errors, reconnect, authoritative catch-up, and Terminal snapshot restoration.
- The TUI uses the pinned Pi TUI component boundary without loading extension modules or starting a raw Pi TUI process.
- Built-CLI subprocess tests and PTY-driven TUI tests prove every retained local workflow.

## Exit condition

A user can perform every approved local-daemon MVP workflow through the built CLI or TUI. The TUI provides the Paseo Workspace canvas without changing daemon ownership.
