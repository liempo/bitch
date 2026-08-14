# Daemon Protocol

## Status

Approved MVP technical specification. Implementation is pending.

## Protocol source

BITCH copies and adapts Paseo's WebSocket protocol at the pinned source commit.

The copied `packages/protocol` package is the wire-schema authority. BITCH does not maintain the former HTTP, OpenAPI, SSE, or Problem Details protocol.

## Connection

One physical WebSocket connects a client route to one daemon.

The client sends a hello envelope with:

- client ID.
- a copied client type (`mobile`, `browser`, `cli`, or `mcp`).
- protocol version.
- app version when available.
- advertised capabilities.

The BITCH TUI identifies as `cli` in the MVP. Adding a wire-level `tui` type is deferred because it is not required for behavior or authorization.

The daemon sends server information through a status session message. It includes the stable daemon ID, hostname, version, features, and supported capabilities.

A connection targets one daemon. Resource messages do not need a daemon path prefix.

## Message classes

The connection carries:

- top-level hello, ping, pong, and session envelopes.
- JSON session requests, responses, snapshots, and events.
- binary terminal frames.
- binary file-transfer frames only where a retained MVP workflow requires them.

Request and response pairs use `requestId`. A transport response ID correlates one request. It is not a durable retry receipt.

## Conversation synchronization

Live Conversation events provide immediacy. They do not replace authoritative reads.

The daemon commits normalized timeline rows to its runtime timeline with an epoch and sequence positions. Clients fetch projected pages through the copied timeline request. The runtime rows are not durable across daemon restart.

Opening or resuming a Conversation fetches one latest tail page. Older history uses backward pagination.

When a client detects a gap, it fetches forward pages until `hasNewer` is false. A page includes the sequence coverage needed to advance the cursor across projected rows.

A same-epoch response with the same tail is a display no-op. An epoch change, rewind, or true middle gap causes atomic canonical replacement.

Clients must reconcile live rows with fetched source ranges. They must not append a projected full message to an already-rendered live prefix.

## Client replicas

A client cache is a display replica only.

The durable copied cache stores only a truncated display tail and focused Conversation identity. It does not persist cursors, epochs, source ranges, older-history availability, or authority status. The first daemon tail response establishes the current epoch and canonical tail.

Client disconnect destroys connection liveness, not daemon resources.

## Conversation mutations

The daemon serializes provider foreground work according to its Conversation lifecycle. Pi rejects or queues unsupported overlap through the retained Paseo path.

Accepted prompts can carry a client message ID. The daemon records the canonical submitted user row according to Paseo's copied behavior.

BITCH does not add the former command hash, durable receipt, or at-most-once command transaction to the MVP.

## Permissions

Pi RPC dialog requests map into daemon permission requests.

The retained Pi adapter supports question mappings for:

- `select`.
- `confirm`.
- `input`.
- `editor`.

A permission response addresses the daemon request ID. Once resolved, the daemon broadcasts the resulting state.

Unsupported Pi terminal UI does not enter the wire protocol.

## Terminal binary frames

Terminal streaming uses the copied Paseo binary frame format:

```text
byte 0: opcode
byte 1: terminal stream slot
remaining bytes: opcode payload
```

The retained opcodes are:

- output (`0x01`).
- input (`0x02`).
- resize (`0x03`).
- snapshot (`0x04`).
- restore (`0x05`).

A Terminal subscription returns a connection-local slot. The client sends input and resize frames through that slot. Output and snapshot frames use the same slot.

## Terminal restore

The daemon keeps a headless terminal state for each live PTY.

On subscription, the daemon sends a current snapshot and then replays output newer than that snapshot revision. Revision filtering prevents duplicate output.

The client can request bounded scrollback and visible-state restore according to the copied protocol.

Terminals do not survive daemon shutdown. Restore applies only while the daemon runtime still owns the PTY.

## Terminal size ownership

A resize includes `claim` or `update` intent when the negotiated protocol supports it.

- A claim assigns size ownership to that client session.
- An update applies only for the current owner.
- A later claim transfers ownership.
- A claim can transfer ownership even when rows and columns are unchanged.

Input is not subject to this size lease. Multiple attached clients can write.

## Liveness and backpressure

Clients use Paseo's application-level JSON ping and pong behavior. An application socket lease expires after 45 seconds without renewal and is checked every 10 seconds.

The daemon applies the copied 64 MiB physical-socket outbound high-water mark. A socket that exceeds the limit is terminated without stopping other clients or daemon resources.

Normalized tool output uses Paseo's copied content bounds before it enters live or authoritative timeline paths.

Terminal streaming preserves Paseo's coalescing and snapshot catch-up behavior. Output frames are bounded at 256 KiB. A keeping-up direct client continues to receive output. After more than 256 KiB of produced output, a direct client with more than 4 MiB queued can receive a fresh snapshot. A transport with no backpressure signal uses snapshot fallback after that produced-output threshold.

## Direct security

Loopback is the default listen boundary.

A direct network route can require Paseo password authentication. The password controls access but does not encrypt traffic.

Direct remote use must use a trusted VPN, private TLS, or another operator-secured route. Host-header checks protect browser-facing endpoints from DNS rebinding according to the copied daemon behavior.

## Relay security

Relay use is opt-in.

The daemon owns a persistent Curve25519 keypair. Pairing gives the client the daemon public key through a QR code or pairing link.

The copied relay derives a shared key with Curve25519 and encrypts frames with XSalsa20-Poly1305. The relay routes authenticated ciphertext and is not trusted with application plaintext.

Text and binary application frame kinds remain compatible with the negotiated relay capability.

## Compatibility

Retain Paseo's capability negotiation and boundary normalization during the initial import.

When BITCH changes the copied protocol:

- prefer additive optional fields.
- gate a new value or behavior with advertised capabilities when an older peer cannot ignore it.
- normalize compatibility at protocol boundaries.

BITCH does not promise public protocol stability for the personal MVP. Behavioral tests still pin the copied baseline so later pruning does not silently change it.
