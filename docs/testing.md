# Testing

## Status

Approved minimal first-release testing strategy. Implementation is pending.

## Principle

Tests verify observable behavior through public interfaces. A test must not pass only because source text, an import, a class, a method, or an internal symbol exists.

Valid observations include:

- an HTTP response.
- an SSE event.
- a Pi JSONL entry.
- a filesystem change.
- built CLI stdout, stderr, or exit status.
- process and container behavior.

Compilation, linting, and generated-file freshness are build checks. They do not count as behavioral tests.

## Test placement

Use four test layers.

### BITCH-owned behavior

Use Vitest for BITCH-owned rules. Call public package interfaces and use real temporary files when storage behavior matters.

Examples include:

- retained daemon messages, pagination, snapshots, Terminal frames, and errors in [`architecture/protocol.md`](architecture/protocol.md).
- protocol validation and error mapping.
- command receipts, RFC 8785 hashing, create retries, cross-conversation ID conflicts, and conversation-lock conflicts.
- concurrent Directory-mode acceptance with the same command ID.
- gateway registry writes, selection, and preservation of compatible additive fields.
- master gateway behavior.
- stable gateway identity validation.
- local lifecycle locking.
- path containment.
- catalog writes, additive-field preservation, and recovery.
- Trash state changes and projected-reason precedence.
- gateway-global viewed and completion state.

Recovery tests must cover:

- a valid older Pi session migration with a recovery copy.
- an incomplete final JSONL line.
- ambiguous interior JSONL damage.
- restoration from a valid catalog backup.
- two invalid catalog files.
- restart at each durable Trash operation stage.
- permanent-deletion staging.
- restart at each new-conversation creation-receipt stage.
- accepted and running receipts after restart.
- graceful SIGTERM draining and forced-stop recovery.
- registry corruption without gateway data loss.
- competing starts for one local gateway data root.
- failure during a runtime-configuration change.
- a concurrent registry mutation during local creation.
- a settled historical operation label without an operation record.
- proven reconciliation after host or Docker restart.
- ambiguous labels, mounts, identities, operation records, and multiple candidate containers.

Do not add unit tests for thin wrappers or internal wiring. Do not unit-test behavior owned by Pi.

### Agent Server integration

Start the real Fastify Agent Server. Send requests through HTTP and receive events through SSE.

Use:

- the real pinned Pi SDK.
- real `AgentSessionRuntime` and `AgentSession` objects.
- real temporary files.
- a scripted local model-provider HTTP endpoint.

The model provider is the only fake in the core integration path. It returns deterministic streams, tool calls, and failures without paid external calls.

Each Pi command mapping in [`architecture/pi-capabilities.md`](architecture/pi-capabilities.md) needs an integration test through the protocol and exact built CLI path.

CLI tests cover:

- required conversation IDs and cross-gateway rejection.
- operation-specific settlement waiting and explicit command-ID retries.
- Gateway-mode detach and Directory-mode detach rejection.
- JSONL events and terminal results.
- SIGINT before and after acceptance.
- abort timeout and repeated SIGINT.
- continued Gateway-mode work after network loss.
- direct-bash truncation, live chunks, and server temp-path omission.
- session statistics without an absolute server session path.
- Directory-mode owner-lease expiry after client death.
- no implicit last, title, or index selection.

Machine-output tests require typed success and problem results on stdout. Human-readable failures use stderr.

API tests cover:

- pagination revisions and stale cursors.
- subscriber-before-snapshot ordering.
- parallel tool event order.
- durable entry, session-name, and thinking-level change events.
- stream replacement, sequence gaps, and unknown additive event types.
- durable-message deduplication.

These tests verify BITCH delegation and event mapping. They do not test Pi internals.

Image tests cover PNG, JPEG, WebP, GIF, invalid bytes, conversion, resizing, JSONL restoration, and rejection of general binary attachments.

Title tests cover first-message derivation, manual Pi naming, name clearing, image-only fallback, reload, and absence of a title-specific model request.

Gateway-mode integration tests verify the stable gateway ID. Conversation receipts, events, artifacts, and workspace resources include their gateway scope. Directory-mode integration tests verify the fixed `cwd` and absence of workspace management.

### Built CLI end to end

Tests execute the built CLI as a subprocess. They do not import CLI implementation modules.

The core gateway workflow must:

1. Start a real Gateway-mode Agent Server container.
2. Register it through the built `bitch gateway` command.
3. Select it through `--gateway`.
4. Send one prompt with `--jsonl` through the scripted model provider.
5. Receive streamed events.
6. Verify Pi JSONL persistence.
7. Replace the container while preserving `/data`.
8. Verify that the gateway ID does not change.
9. Reconnect to the gateway.
10. Reopen the conversation.

The Directory-mode workflow must:

1. Run the built CLI with a prompt and without `--gateway`.
2. Verify that the CLI starts one uniquely named and labeled temporary Docker container.
3. Verify that it binds the dynamic host port only to `127.0.0.1`.
4. Verify that it uses the identity-mounted current directory as the fixed `cwd`.
5. Verify that it mounts the shared configuration, sessions, receipts, Trash, and recovery roots.
6. Verify that the scripted provider handles the prompt.
7. Verify the typed output.
8. Verify Pi JSONL persistence.
9. After CLI exit, verify that the CLI stopped the temporary container.
10. Verify that the CLI removes that container.
11. Before another invocation, place a stopped stale container.
12. Verify that the next invocation removes the stale container.
13. Place a running container from another invocation.
14. Verify that the CLI leaves the running container unchanged.
15. Kill a separate owning CLI without graceful cleanup.
16. Verify that lease expiry stops its temporary Agent Server.
17. Verify that a later invocation removes the stopped container.

Non-interactive extension tests run the built CLI in print, JSON, and JSONL modes. They verify that Gateway mode preserves a pending dialog for a TUI. Directory mode cancels it during container shutdown. No mode reads stdin.

Provider authentication tests cover status, login, polling, prompt responses, cancellation, logout, and mode isolation through HTTP and the TUI. Fixtures cover every pinned prompt and notification variant.

Tests also cover one active operation per provider, cross-process Directory-mode exclusion, and server-restart cancellation. Local and remote tests cover browser callbacks, device codes, and manual codes.

Responses, CLI output, and logs never expose credential values.

`SOUL.md` tests cover byte-for-byte source copying, default fallback, destination preservation, atomic writes, and absence of later synchronization. HTTP fixtures cover the binary media type, digest ETag, creation precondition, and conflict response.

Multiple-client tests cover shared events, simultaneous commands, global completion-viewed state, explicit mark-viewed, read-only query preservation, foreground versus background streams, disconnect completion, and reconciliation without duplication.

Remote registration tests cover endpoint normalization, credential rejection, live status verification, same-identity replacement, identity mismatch, and gateway-scoped resource misuse.

Workspace clone tests cover all supported URL forms and gateway-preconfigured private credentials. They verify non-interactive failure and strict host checking. They reject secret-bearing and local URLs. They also verify safe diagnostics and staged cleanup.

Workspace reconciliation tests cover missing-state isolation, unrelated availability, read-only sessions, and missing default behavior. They reject symbolic links. They verify exact-path restoration with stable identity and occupied-path refusal. External rename must not transfer identity.

Destructive-action tests cover CLI and TUI Trash behavior, exact-ID permanent confirmation, and canceled TUI sheets. Missing and mismatched confirmations must send no HTTP request. Tests also cover active-resource refusal and default-workspace protection. Conversation deletion tests also cover transactional JSONL, receipt, and export removal. Downloaded copies remain unchanged. Workspace deletion tests retain exports with read-only conversations.

Gateway-selection tests must cover:

- master gateway selection.
- named gateway selection.
- no master gateway.
- an unknown alias.
- an unavailable gateway.
- no automatic fallback.
- isolation between two gateways.
- non-interactive operation without stdin prompts.

### TUI compatibility

TUI tests verify observable compatibility with the pinned Pi TUI and its RPC extension boundary.

They use PTY-driven behavior tests and focused normalized screen snapshots at fixed terminal sizes. Snapshots remove timestamps, generated IDs, and environment-specific paths. Tests do not use one full-session ANSI recording as the only proof of behavior.

They cover:

- Gateway home startup without viewed-state changes.
- Directory blank-draft startup without empty-session creation.
- exact `--conversation` startup and invalid-scope refusal.
- Pi layout and editor behavior.
- pinned Pi `edit` diff data and local rendering without arbitrary-output inference.
- supported built-in commands, keybindings, and each pinned `/settings` field.
- absence of unsupported package, update, import, share, and llama.cpp commands.
- configured extension commands.
- selected-conversation resource reload through the CLI and `/reload`, including busy-state refusal.
- extension dialogs and fire-and-forget UI.
- background-dialog focus isolation, gateway activity events, source-labeled notifications, and foreground-only editor text.
- `custom()` returning `undefined` in RPC mode.
- no-op, default-return, and fallback behavior for terminal-only methods and renderers.
- server-side extension discovery, provenance, project-trust interaction, one-run overrides, and reload.
- trusted Gateway-mode project settings, extensions, and configured package behavior.
- selected mode, gateway alias, and connection-state presentation.
- the boundary for terminal-only extension methods.
- absence of first-release gateway management and switching inside the TUI.

Tests must not inspect vendored source text or internal symbols as proof of behavior.

### Deferred Gateway Hub tests

When `/gateway` enters product scope, PTY-driven tests must verify:

- local command precedence over server extension commands with the same name.
- use before connection, after initial failure, and while disconnected.
- CLI-equivalent registry, status, master, lifecycle, deletion, and `SOUL.md` effects.
- one active target and no implicit master change or fallback.
- gateway switching without aborting gateway work.
- Directory-mode **Stay** and **Abort and switch** behavior.
- target preparation failure preserving the current view and connection.
- discarding events from an old connection generation.
- pending dialog restoration after switching back.
- active-registration deletion disconnecting only the client.
- local pinned Pi TUI components without terminal objects crossing RPC.

Tests exercise the TUI and real shared client control plane. They do not call private hub or registry methods as proof of behavior.

### Deferred native registry tests

When Phase 7 starts, the Swift registry store must run the TypeScript registry fixture corpus. The corpus covers schemas, lock contention, atomic writes, migration, and corruption.

Cross-language tests race public Swift app actions with the built CLI. They verify one shared revision history.

## Container runtime tests

The first release tests Docker for Directory mode and local gateways.

Local gateway tests verify:

- omitted and explicit `docker` backend selection.
- unavailable `apple` selection fails before any durable or runtime side effect.
- creation returns a ready registered gateway and leaves it running.
- start, stop, and restart behavior.
- stop and restart refuse active work unless `--force` is present.
- forced lifecycle operations abort work, wait up to 10 seconds, preserve durable state, and never replay interrupted commands.
- registry deletion removes the local endpoint registration without stopping the container or changing gateway data.
- BITCH does not track or rediscover the unregistered local gateway.
- a retained local endpoint can return only through normal externally managed gateway registration.
- persistence after all clients disconnect.
- on-demand startup.
- no automatic login startup.
- independent data roots for multiple local gateways.
- one active container for one gateway data root.
- identity preservation across container replacement.
- host UID and GID use for bind-mounted data.
- local and gateway permission failures without automatic recursive ownership changes.
- absence of the Docker socket inside Agent Server containers.

Remote deployment tests build the packaged Compose context, start it as a numeric non-root UID and GID, and use a mode `0700` bind-mounted data root. They verify readiness, stable identity, restart persistence, and failure on incompatible ownership.

Remote network tests verify that Compose publishes the port only on the configured Tailscale IP. Requests through that interface succeed according to Tailnet ACLs.

The LAN and wildcard interfaces do not expose the port. Requests with an `Origin` header fail with `browser_origin_not_allowed`. Responses contain no CORS allow headers.

Backup tests verify the SHA-256 tree manifest and restore a complete stopped-gateway copy. They verify its gateway ID, backend record, sessions, workspaces, configuration, credentials, and Trash. They reject cross-backend restoration.

Conversation export tests verify that credential files and `/data/secrets` are absent. They also verify that prompts, messages, and tool output receive no arbitrary redaction.

Apple `container` tests are deferred until that runtime driver enters the product scope. The future driver must pass the local-runtime conformance suite. Apple creation must use a new identity and data root. It must not open or change an existing Docker gateway.

## Upgrade compatibility

Compatibility tests run the current and immediately previous BITCH releases in both client-server directions. They verify protocol negotiation, required capabilities, gateway identity, Pi JSONL restoration, and supported extension behavior.

Upgrade tests create a complete backup, apply each recognized schema migration, and verify readiness and durable state. Rollback tests use the previous image when schemas remain compatible and require full backup restoration otherwise.

Pi or TUI version changes run the complete capability matrix and observable TUI compatibility suite.

## Supported-scale verification

Release tests register eight independent gateways. Each gateway runs two conversations concurrently, and two clients share one conversation. Tests verify isolation, event consistency, command ordering, and durable reconciliation.

The first release has no latency assertion. Tests still use bounded operation timeouts to detect hangs. A timeout is a correctness failure, not a performance service-level objective.

## Release artifact verification

Release checks install the packed npm artifact in a clean environment. They build the Agent Server image from its included context and run the Directory-mode and Gateway-mode workflows.

Generated checks verify npm provenance configuration, source-archive checksums, the SBOM, and third-party license notices. The release must not reference a prebuilt OCI image.

## Platform matrix verification

Release tests run the packed npm artifact on macOS 26.5.2 arm64 with Docker Desktop 4.62.0. Remote tests run the Compose deployment on Ubuntu Server 24.04 LTS amd64 with Docker Engine 29.2.1 and Compose 5.0.2.

Build checks verify Node.js 24.19.0, Pi 0.83.0, Pi TUI 0.83.0, the npm lockfile, and the pinned container base digest. A version mismatch blocks release.

## Paseo source-import gate

Run the offline gate before any pull request copies or adapts Paseo source:

```bash
npm run check:provenance
```

Set `PASEO_SOURCE` to a clean local checkout of the pinned Paseo commit. Then verify the author snapshot and upstream evidence:

```bash
test "$(git -C "$PASEO_SOURCE" rev-parse HEAD)" = 163e7d1cc421cdfe4de67b971ff6cea4b51eb0ed
test -z "$(git -C "$PASEO_SOURCE" status --short)"
cmp LICENSE "$PASEO_SOURCE/LICENSE"
npm run provenance:authors -- --upstream "$PASEO_SOURCE" --check
node scripts/provenance/validate-paseo-import.mjs --upstream "$PASEO_SOURCE"
```

A source-import pull request must add one inventory entry for each copied or adapted file. It must update the dated modification statement in `NOTICE.md` when the first Paseo package source enters BITCH.

The gate rejects missing paths, duplicate destinations, wrong pins, wrong blobs, wrong hashes, missing notices, and an imported excluded artifact. Keep `silero_vad.onnx` excluded until its exact origin and redistribution terms are verified.

## Pull-request gate

Every pull request runs:

1. TypeScript compilation and linting.
2. Generated protocol freshness checks.
3. Vitest tests for BITCH-owned behavior.
4. Real Agent Server integration tests.
5. The built-CLI Gateway-mode Docker workflow.
6. The built-CLI Directory-mode Docker workflow.

The target duration is 15 minutes or less.

## Test rules

- Test public behavior, not source structure.
- Use the real Pi SDK in integration tests.
- Fake only external systems that must be deterministic or unavailable.
- Execute the built CLI as a subprocess for end-to-end behavior.
- Do not mock `AgentSession` or `AgentSessionRuntime`.
- Add a behavioral regression test for each fixed defect.
- Do not use a private test-only CLI protocol.
- Do not treat code coverage as proof of correctness.
- Do not retry a failing test automatically to hide flakiness.
