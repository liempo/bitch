# Deferred Planning Gaps

## Purpose

This file contains questions that do not block the CLI and TUI MVP. The GitHub Project owns any later delivery status.

Do not resolve these packets until Phase 7 starts. When a question is resolved, update the authoritative document and Phase 7 boundary, then remove the resolved question.

## D01: Desktop window and layout details

**Question scope:** Select which pinned Paseo multi-window, geometry, menu, deep-link, and panel-layout details BITCH keeps unchanged.

- What are the first-window and later-window geometry persistence rules?
- How do new windows and deep links behave?
- What does panel close do for root and future nested resources?

## D02: Desktop Pi-control presentation

**Question scope:** Place every retained Pi control and permission state in the graphical Conversation panel.

- Where do model, thinking, stop, compaction, rewind, and command controls appear?
- How does the client present pending, failed, interrupted, closed, and archived states?
- How does it present unsupported terminal-only extension UI?

## D03: Desktop Workspace recovery

**Question scope:** Define graphical archive, recovery, and destructive-action presentation without adding BITCH-specific lifecycle semantics.

- What warnings apply to local Workspace archive?
- How does the client present managed-worktree archive and recovery?
- What confirmation applies to Conversation unarchive and deletion?

## D04: Desktop verification and distribution

**Question scope:** Select supported macOS package variants and release gates.

- Which architecture and minimum macOS version are supported?
- What are the signing, notarization, update, and rollback gates?
- How does packaging verify daemon and CLI compatibility?
- Where do the source offer and `AGPL-3.0-only` notices appear?

## D05: Shared iOS foundation

**Question scope:** Decide how much mobile infrastructure Phase 7 includes before an iOS product stage starts.

- What is the shared app platform-adapter boundary?
- Do audio dependencies enter Phase 7 or remain deferred?
- Which compact Workspace and Terminal views must remain reusable on iOS?
