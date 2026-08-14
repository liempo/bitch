# Testing

## Status

Approved MVP testing specification. Implementation is pending.

## Principle

Use the pinned Paseo test corpus as the primary behavioral baseline. Run copied Paseo tests against copied local packages.

Do not rewrite a Paseo test as a BITCH test only to change names or file layout. Add BITCH tests only for approved differences, missing public proof, and BITCH-owned behavior.

Type checks, lint checks, and generated-file checks are build checks. They are not behavioral tests.

## Paseo baseline

The behavioral reference is Paseo source with package version 0.3.1 at commit [`163e7d1`](https://github.com/getpaseo/paseo/tree/163e7d1cc421cdfe4de67b971ff6cea4b51eb0ed). Use the exact commit, not the earlier `v0.3.1` tag.

Copy each retained package's applicable tests with its production source. Also copy the test fixtures, helpers, Vitest configuration, and package test scripts that those tests need.

Keep a copied test unchanged when BITCH retains its behavior. Adapt only imports, package or executable names, paths, environment setup, and expectations affected by an approved BITCH difference or Pi 0.83.0 compatibility.

Run copied tests against local copied workspaces. A test must not resolve a published Paseo package when that package exists in BITCH.

Keep applicable Paseo unit tests even when they call package-internal surfaces. They remain baseline regression tests. Add a public-boundary test only when BITCH changes the behavior or the copied test does not prove a required public outcome.

Classify each upstream test as copied unchanged, copied with an adaptation, excluded, or replaced. Record the upstream path, classification, reason, retained or excluded behavior, and replacement test or issue when applicable.

An exclusion requires an excluded product feature, an external credential or paid provider, a hosted service, an unsupported platform, or an artifact excluded by the approved licensing and provenance policy. Do not exclude a test only because it is slow, flaky, or internal.

## Copied Paseo suites

Preserve the pinned package test entry points:

| Package | Pinned test entry point |
| --- | --- |
| `protocol` | `npm run test --workspace=@getpaseo/protocol` |
| `relay` | `npm run test --workspace=@getpaseo/relay` |
| `highlight` | `npm run test --workspace=@getpaseo/highlight` |
| `client` | `npm run test --workspace=@getpaseo/client` |
| `server` | `npm run test --workspace=@getpaseo/server` |
| `server` deterministic daemon E2E | `npm run test:e2e --workspace=@getpaseo/server` |
| `cli` unit and local E2E | `npm run test --workspace=@getpaseo/cli` |

The root `npm test` command must run the default test script for every retained workspace. Approved package rebranding can change workspace selectors, but it must not change test selection or behavior.

Keep Paseo's test suffix meanings. Default `*.test.ts` tests are deterministic. `*.e2e.test.ts` tests use a real daemon. `*.real.e2e.test.ts` tests need a real external provider. `*.local.e2e.test.ts` tests need a local-only resource.

## Test layers

Use copied Paseo tests at each applicable layer:

1. copied package unit tests for protocol, relay, highlight, client, server, and CLI behavior.
2. copied deterministic daemon and CLI end-to-end tests.
3. BITCH public-boundary tests for intentional product differences and missing retained coverage.
4. PTY-driven tests for the BITCH-owned TUI.
5. direct and encrypted-relay remote tests not already covered by copied suites.

## Coverage rule

The following sections define required outcomes. They do not require duplicate BITCH tests when an applicable copied Paseo test already proves the outcome.

For each outcome:

1. Find the applicable test in the pinned Paseo source.
2. Copy and run that test against the local workspace.
3. Adapt it only when an approved BITCH boundary requires the change.
4. Add a new public-boundary test only when no applicable copied test proves the outcome.

## Deterministic Pi integration

Do not mock Pi's SDK `AgentSession` or `AgentSessionRuntime` as proof of daemon behavior. The MVP does not embed them.

Use the real pinned Pi RPC process for integration behavior. Configure Pi with a scripted local model provider so model output, tool calls, retries, compaction, dialogs, and failures remain deterministic.

A small fake Pi process is acceptable only for protocol error cases that the real scripted Pi process cannot produce deterministically. It does not replace the real Pi integration suite.

## Source-import checks

Before pruning copied code, verify:

- the copied package set builds.
- each retained workspace's copied default test entry point passes.
- applicable copied deterministic server and CLI end-to-end tests pass.
- every adapted, excluded, or replaced upstream test has the required classification record.
- the root license, package metadata, dated modification notices, selected-path author snapshot, source inventory, interactive legal notices, and remote Corresponding Source offer follow [`architecture/licensing.md`](architecture/licensing.md).
- package identities do not accidentally publish under Paseo names.

Run the offline gate for every source-import pull request:

```bash
npm run check:provenance
```

Set `PASEO_SOURCE` to a clean local checkout at the approved commit. Then run:

```bash
npm run provenance:authors -- --upstream "$PASEO_SOURCE" --check
node scripts/provenance/validate-paseo-import.mjs --upstream "$PASEO_SOURCE"
```

The first package-source import must replace the pre-import statement in `NOTICE.md` with the actual first modification date.

## Pi-only adaptation checks

Before accepting the Phase 2 public Pi boundary, verify:

- the public provider catalog contains only Pi.
- the copied agent-launch Terminal profile surface is not publicly available.
- a non-Pi creation request fails before a non-Pi process starts.
- applicable copied tests still pass after the public-boundary changes.

## Protocol tests

Test the copied WebSocket boundary for:

- hello and server information, with the TUI using copied client type `cli`.
- stable daemon identity.
- capability negotiation.
- request and response correlation.
- application ping and pong liveness and the copied 45-second lease.
- 64 MiB outbound backpressure disconnect.
- unknown additive fields.
- unknown Pi RPC events failing or being ignored within one Conversation instead of crashing the daemon.
- direct and relay routes to one daemon ID.
- authentication failures without secret disclosure.

Test binary terminal codecs with raw bytes, not source snapshots.

## Conversation integration

Start the real daemon and connect through the public client.

Cover:

- strict LF-delimited Pi JSONL framing without generic Unicode line splitting.
- create and run a Pi Conversation.
- Pi 0.83 cumulative-message updates without duplicate assistant text.
- Pi retry settlement: `agent_end` with `willRetry: true` stays running, and only `agent_settled` ends an agent turn.
- a handled local extension command that starts no agent run completes without waiting for `agent_settled`.
- successful compaction completion, plus failed and aborted compaction without a false `completed` item or a stuck loading item.
- normalized user, assistant, reasoning, tool, compaction, and error items.
- canonical submitted-message identity.
- copied normalized tool-output bounds on live and fetched paths.
- multiple concurrent Conversations.
- multiple clients on one Conversation.
- disconnect while work continues.
- stop only after Pi cancellation acknowledgement.
- Pi process exit during a turn.
- daemon restart, new timeline epoch, Pi history reconstruction, and later Pi resume.
- model and thinking changes.
- manual and automatic compaction.
- rewind through the injected Pi integration extension.
- image prompts for vision and text-only models, including private temporary-file permissions.
- extension, prompt-template, and skill commands.
- no `--mcp-config` launch flag and no Paseo Agent MCP endpoint.
- `select`, `confirm`, `input`, and `editor` question mapping.
- unsupported extension UI fallback.

## Timeline synchronization

Test both live and authoritative paths.

Cover:

- initial latest-tail load.
- backward pagination.
- multi-page forward gap recovery.
- same-tail no-op.
- adjacent and overlapping page reconciliation.
- projected item source ranges.
- live assistant prefix followed by projected full text.
- epoch change.
- rewind.
- true middle-gap replacement.
- reconnect without duplicate rows.
- cache paint followed by authoritative bootstrap.
- local submitted row acknowledgement before and after RPC settlement.

A test must prove that one row never appears in both canonical and live lanes after reconciliation.

## Pi session import

Use real temporary Pi JSONL sessions.

Cover:

- default Pi agent directory discovery.
- explicit Pi directory override.
- `cwd` filtering.
- default 20-result limit and large candidate lists.
- bounded Pi JSONL head and tail scanning.
- first and last prompt previews.
- session name where available.
- model and thinking restoration.
- explicit import.
- no Conversation creation during listing.
- resume with the exact native Pi session path.

## Project and Workspace tests

Use real temporary directories and Git repositories.

Cover:

- exact lexical Project identity.
- opaque Project and Workspace IDs.
- local Workspace creation.
- explicit Workspace creation always minting a fresh ID.
- managed-worktree creation.
- multiple Workspaces with one `cwd`.
- deterministic oldest exact-path selection and archived-match restore.
- bare run creating a fresh Workspace.
- explicit context reusing a Workspace.
- local archive preserving files.
- final-reference managed-worktree removal.
- recovery from persisted placement metadata.
- no path derivation from Workspace ID.
- no cross-daemon identity or authority merging, including when `projectKey` matches.

## Terminal integration

Use real PTYs and the public binary stream.

Cover:

- named Terminal creation.
- output and input frames.
- screen and bounded scrollback snapshot.
- revision-based replay after snapshot.
- no duplicate or missing boundary output.
- 256 KiB output threshold and 4 MiB queued-byte snapshot fallback.
- detach without kill.
- multiple observers.
- multiple writers.
- terminal capture.
- title change.
- explicit kill.
- Workspace archive teardown.
- daemon shutdown teardown.
- absence after daemon restart.

Test size ownership:

1. client A claims size.
2. client B sends an update without a claim.
3. the daemon ignores B's update.
4. client B claims the same size.
5. ownership transfers.
6. B's later update applies.

Also verify that passive attach and rendering do not steal size ownership.

## CLI end to end

Execute the built CLI as a subprocess. Do not import CLI implementation modules.

Cover:

- explicit `bitch onboard` first-run setup.
- detached and foreground daemon start.
- status, stop, and restart.
- missing-daemon guidance.
- daemon registry add, select, list, and remove.
- localhost removal and re-enablement without stopping an independently CLI-started daemon.
- run, list, attach, inspect, send, wait, stop, archive, reload or auto-unarchive, import, update, and delete for Pi Conversations.
- Workspace create, open, list, rename, archive, and recover.
- Terminal create, list, capture, send-keys, and kill.
- human and copied machine-output modes.
- no ANSI or secrets in machine output.
- explicit remote host targeting.
- no fallback after target failure.

## TUI tests

Drive the built TUI through a PTY at fixed terminal sizes.

Cover:

- daemon and Workspace selection.
- tabs.
- user-created splits and the copied four-level depth limit.
- Conversation and Terminal panels side by side.
- panel focus and layout persistence across client restart.
- Terminal panel close as detach.
- root Conversation tab close as confirmed global archive.
- connection loss and reconnect.
- timeline catch-up.
- pending Pi question presentation.
- model and thinking controls retained from Paseo.
- edit and diff presentation.
- terminal snapshot restore.
- terminal size claims on focus or direct interaction.
- use of the pinned Pi TUI component package without a raw Pi TUI process.
- no loading of extension modules in the client.

Normalize generated IDs, timestamps, and temporary paths in screen snapshots. Do not use a full ANSI recording as the only behavioral proof.

## Remote direct tests

Run a daemon on a separate test endpoint.

Cover:

- registration by stable daemon ID.
- password success and failure.
- trusted VPN or TLS route configuration in the test environment.
- route loss without daemon deselection.
- no action on localhost after remote failure.
- two daemons with isolated Projects, Workspaces, Conversations, and Terminals.

## Relay tests

Use the copied relay package and an isolated relay test server.

Cover:

- relay disabled by default.
- explicit enablement.
- pairing offer generation and parsing.
- daemon public-key verification.
- authenticated encrypted text frames.
- authenticated encrypted binary Terminal frames.
- tamper rejection.
- reconnect to the same daemon ID.
- relay inability to observe application plaintext in its public events and logs.

A live hosted-relay test can be optional. Local cryptographic and protocol tests are required.

## Recovery tests

Cover:

- stale PID file for a non-running process.
- live PID lock that must not be reclaimed.
- desktop-managed unreachable lock with fresh and older-than-five-minute heartbeats.
- competing daemon starts for one home.
- invalid config startup failure without data replacement.
- invalid Project or Workspace registry logging, empty-view behavior, and operator mutation stop.
- invalid Conversation record skip behavior.
- Pi process crash.
- graceful shutdown ordering and the copied 10-second ceiling.
- daemon crash.
- interrupted turn not replayed.
- durable Conversation reload and normalized timeline reconstruction from Pi JSONL.
- Project and Workspace reload.
- runtime-only Terminal loss.
- localhost disable, independently started daemon survival, and later recovery.
- backup and restore of daemon home plus Pi state.

## Security tests

Cover:

- loopback default binding.
- bcrypt password hashing, restart activation, and authentication.
- direct-route password precedence without credential output.
- no password plaintext in configuration or logs.
- authorization and WebSocket-protocol credentials redacted from logs.
- no false automatic-log-rotation claim.
- Host-header rejection according to copied Paseo rules.
- relay secret-key file permissions.
- no Pi credential values in protocol output.
- non-Pi agent runtime exclusion.
- remote failure without fallback execution.

## Pull-request gate

Run each available suite that covers the changed behavior. Do not use an empty or unavailable future suite as a passing check.

After the owning implementation phase adds a suite, an applicable code-changing pull request runs:

1. formatting, lint, and TypeScript build checks.
2. the copied Paseo default suites for protocol, relay, highlight, and client.
3. the copied Paseo server default suite and applicable deterministic daemon end-to-end tests.
4. real Pi scripted-provider integration tests for the Pi 0.83.0 difference.
5. the copied Paseo CLI unit and local end-to-end suite.
6. built CLI remote-daemon tests not covered by the copied suite.
7. copied and added Terminal PTY integration tests.
8. focused PTY-driven tests for the BITCH-owned TUI.
9. license, test-classification, and source-provenance checks.

A documentation-only or pre-import pull request runs its available documentation, configuration, and provenance checks. The Phase 6 release gate runs every implemented entry.

## Test rules

- Start with the applicable pinned Paseo test.
- Do not replace copied coverage with a parallel BITCH test.
- Preserve copied test logic unless an approved difference changes its expected behavior.
- Test new BITCH behavior through a public boundary.
- Execute the built CLI as a subprocess for added end-to-end tests.
- Use real Pi RPC integration for behavioral proof.
- Use real PTYs for Terminal behavior.
- Fake only external systems that require determinism or isolation.
- Add a regression test for each fixed defect.
- Do not automatically retry failures to hide flakiness.
- Do not treat code coverage as proof of correctness.
