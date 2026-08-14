# Conversation Behavior

## Status

Approved MVP product specification. Implementation is pending.

## Conversation ownership

A Conversation is one BITCH record for one Pi native session on one daemon.

The daemon owns live work. A client can disconnect without stopping the Conversation. Multiple clients can observe and control the same Conversation.

Each live Conversation owns one `pi --mode rpc` subprocess. The subprocess uses its Workspace `cwd`.

## Durable authorities

BITCH follows Paseo's two-layer authority model:

- Pi JSONL is the durable native Pi session. It supports Pi discovery, explicit import, resume, and history hydration after a daemon restart.
- While a Conversation is loaded, the daemon's normalized timeline is the authoritative BITCH client history. It supports rendering, pagination, sequence recovery, and cross-client synchronization.

The pinned Paseo daemon keeps normalized timeline rows in memory. It rebuilds them from provider history after process restart. The MVP does not add a new durable normalized-timeline store.

These layers have different responsibilities. A client does not treat its local cache as authoritative.

## Creation and resume

A new Conversation belongs to one Workspace. It uses Pi as its only agent runtime.

The daemon can resume an unarchived closed Conversation under the same BITCH Conversation ID. It starts a new Pi RPC subprocess with the persisted native Pi session handle.

The daemon can list standalone Pi JSONL sessions through Paseo's provider-session discovery. Import is explicit. Discovery does not create BITCH Conversations automatically.

An imported Conversation preserves the model and thinking level that Paseo's Pi adapter can read from the Pi session.

## Lifecycle

BITCH copies Paseo's Conversation lifecycle:

```text
initializing -> idle <-> running
       |         |         |
       +---------+---------+-> error -> closed
```

A closed Conversation keeps its BITCH identity, Workspace, normalized timeline, native Pi handle, title, labels, usage, attention, and timestamps. Opening or prompting it resumes the Pi runtime.

Idle Conversations remain resident until an explicit Paseo lifecycle action or daemon shutdown closes them. BITCH does not add the former five-minute idle disposal rule.

An archive action is a soft delete. It closes the live Pi process and hides the Conversation from active lists while preserving its record and timeline. Unarchive is the explicit transition back to an interactive runtime.

Hard delete follows Paseo's retained Conversation deletion behavior. It can apply to an active or archived Conversation. It interrupts a running turn as the copied command permits, then removes the daemon-owned Conversation record and live normalized timeline. The pinned Pi adapter has no native delete hook, so it does not delete the Pi JSONL session or Workspace files.

BITCH-specific Conversation Trash, tombstones, retention periods, and exact-ID deletion confirmations are deferred.

## Prompts and controls

The MVP exposes the Pi controls that Paseo's Pi adapter provides:

- text and image prompts.
- client-side queued prompts while a Conversation runs.
- stop after Pi acknowledges cancellation.
- model selection.
- thinking-level selection.
- manual compaction.
- automatic compaction control.
- conversation rewind through Pi tree navigation.
- extension, prompt-template, and skill commands returned by Pi RPC.

Paseo serializes foreground Pi turns. A second turn does not start while Pi owns the current turn.

Pi can retry transient model failures or continue after automatic overflow compaction. These are parts of the same accepted Conversation turn. The Conversation remains running until Pi reports final settlement. A low-level Pi run boundary does not make the Conversation idle when Pi reports that more work will follow.

Direct public controls for every Pi RPC operation are not an MVP requirement. Additional steering, follow-up, retry, tree, fork, clone, name, and export controls are deferred unless Paseo already exposes them through its retained Pi path.

## Timeline delivery

The daemon records normalized timeline rows with daemon-owned epochs and sequence positions.

Clients use two delivery paths:

1. Live WebSocket events provide immediate updates.
2. Authoritative timeline fetches establish or repair history.

Opening or resuming a Conversation fetches one bounded latest tail page. Older pages load through backward pagination.

A sequence gap triggers paged forward catch-up until the daemon reports that no newer page remains. An epoch change, rewind, or true middle gap replaces stale canonical history atomically.

A reconnect must not duplicate projected messages or leave a false running state.

## Client cache

A client can keep a short display replica. Its durable cache stores display items and focused identity only. It does not persist timeline cursors, epochs, source ranges, older-history availability, or authority status.

The first daemon tail response establishes canonical client history. Live rows received before that response remain separate until reconciliation.

Removing a registered daemon is the destructive boundary for that daemon's client cache. It does not delete daemon-owned Conversation or Pi data.

## Multiple clients

Multiple clients can:

- view one Conversation.
- receive the same daemon lifecycle and timeline updates.
- submit prompts.
- request stop, model, thinking, permission, and retained lifecycle actions.

The daemon and Pi process order accepted work. BITCH does not add a client ownership lease for Conversation mutations.

Permission resolution follows Paseo behavior. The daemon maps a pending Pi question to one daemon permission request. A valid response resolves that request for all clients.

## Pi extensions

Pi loads standard global and project resources inside its subprocess. This includes extensions, skills, prompts, settings, and project context.

Paseo's Pi adapter maps these dialog methods into question permissions:

- `select`.
- `confirm`.
- `input`.
- `editor`.

Paseo uses selected `notify` messages for command output and its Pi integration markers. Other unsupported fire-and-forget UI can be ignored.

Terminal-only Pi extension components do not cross the daemon protocol. This includes custom components, renderers, editors, overlays, terminal shortcuts, and raw terminal input.

## Tools and diffs

The daemon maps Pi tool events into Paseo's normalized tool-call timeline type. Unknown tools use the standard fallback representation.

Pi edit results can provide structured diff details. Clients render the retained Paseo diff presentation. BITCH does not infer a diff from arbitrary text.

## Images

A vision-capable Pi model receives supported image content through Pi RPC.

When model image support is absent or unknown, Paseo materializes the image in a private daemon-host temporary directory and adds a local path hint to the prompt. The directory uses mode `0700`, files use `0600`, and content-hashed names reuse identical bytes within one daemon process. The file remains a daemon-host resource and is not durable Conversation storage.

General BITCH file attachments are not part of the MVP unless Paseo's retained prompt attachment behavior already supports them.

## Client disconnection

A client disconnect does not stop Pi work, clear the timeline, or close a pending permission.

The daemon remains authoritative. Reconnecting clients fetch current lifecycle state and timeline history before they rely on live deltas.

## Daemon shutdown

Daemon shutdown ends every live Pi RPC subprocess. It does not replay interrupted turns after restart.

Durable Conversation records and native Pi handles remain available. A later open or prompt starts a new Pi process and rebuilds the normalized timeline from Pi history. The timeline epoch and sequence positions can change across daemon restart.

## Deferred improvements

Defer these BITCH-specific additions until after the Paseo-native MVP:

- a daemon-persisted normalized timeline that survives process restart without provider rehydration.
- Pi JSONL as the direct BITCH client protocol.
- durable BITCH command receipts.
- exact parity with every Pi RPC command.
- terminal-only extension UI transport.
- generated titles that require a hidden model call.
- BITCH-specific Trash and export-artifact lifecycle.
