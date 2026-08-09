# Pi Capability Contract

## Status

Approved first-release capability contract for Pi 0.83.0. Implementation is pending.

## Normative source

BITCH pins `@earendil-works/pi-coding-agent` and `@earendil-works/pi-tui` at 0.83.0. The pinned Pi RPC types, dispatcher, documentation, and observable behavior define standard command semantics.

## RPC command equivalence

A BITCH operation is equivalent to a Pi RPC command when it preserves:

- input validation, defaults, and cancellation.
- `AgentSession` and `AgentSessionRuntime` calls.
- extension hooks and command interception.
- queue, retry, compaction, model, and thinking behavior.
- JSONL entries and settings mutations.
- result values and failure meaning.
- Pi event order before transport mapping.

BITCH can change transport framing, resource identifiers, server paths, artifacts, and error encoding. HTTP uses typed schemas and receipts. SSE carries events. Problem Details replaces raw Pi error strings.

Intentional differences are:

- damaged-session safeguards in [`recovery.md`](recovery.md).
- gateway-scoped resource references.
- at-most-once command acceptance.
- multiple-client snapshots and reconciliation.
- client navigation for Pi session replacement.
- server-owned export artifacts instead of arbitrary client paths.
- omission of the direct-bash temporary `fullOutputPath`.
- the pinned Pi RPC extension UI boundary.

BITCH does not claim internal implementation equivalence. It claims equivalent observable behavior through its public boundary.

## Public client notation

The matrix uses these CLI path names under the selected Directory mode or Gateway mode. [`cli.md`](cli.md) defines exact arguments, targeting, waiting, streaming, and detachment:

```text
bitch conversation create
bitch conversation prompt
bitch conversation steer
bitch conversation follow-up
bitch conversation abort
bitch conversation new
bitch conversation state
bitch conversation messages
bitch conversation model ...
bitch conversation thinking ...
bitch conversation queue ...
bitch conversation compact ...
bitch conversation retry ...
bitch conversation bash ...
bitch conversation stats
bitch conversation export
bitch conversation switch
bitch conversation fork
bitch conversation clone
bitch conversation fork-messages
bitch conversation entries
bitch conversation tree
bitch conversation last-assistant
bitch conversation name
bitch conversation commands
bitch conversation reload
```

Every path supports human output and `--json`. Operations that stream also support `--jsonl`. The CLI uses conversation IDs, not server file paths.

## Pi RPC capability matrix

| Pi RPC command | Agent Server operation | Public CLI path | TUI behavior | Persistence | Reconnection | Status |
|---|---|---|---|---|---|---|
| `prompt` | `conversation.prompt` command | `conversation prompt` or `bitch -p` for a new conversation | Editor submit | Receipt, user message, assistant and tool JSONL | Durable messages plus active snapshot | Supported |
| `steer` | `conversation.steer` command | `conversation steer` | Enter while working | Transient queue, then JSONL on delivery | Live queue in snapshot. Lost queue becomes interrupted after restart | Supported |
| `follow_up` | `conversation.followUp` command | `conversation follow-up` | Alt+Enter while working | Transient queue, then JSONL on delivery | Live queue in snapshot. Lost queue becomes interrupted after restart | Supported |
| `abort` | `conversation.abort` command | `conversation abort` | Escape | Pi final aborted state and receipt | Reload durable result and idle snapshot | Supported |
| `new_session` | `conversation.new` command | `conversation new` | `/new` | New Pi JSONL session | Returns and opens a new conversation reference | Supported with transport difference |
| `get_state` | Conversation state resource | `conversation state` | Internal screen state | None | Requery and snapshot | Supported |
| `get_messages` | Conversation message resource | `conversation messages` | Timeline load | Pi JSONL is authoritative | Requery durable messages | Supported |
| `set_model` | `conversation.setModel` command | `conversation model set` | `/model` | Pi model-change entry and Pi settings behavior | Restore from Pi | Supported |
| `cycle_model` | `conversation.cycleModel` command | `conversation model cycle` | Ctrl+P | Same as Pi | Restore from Pi | Supported |
| `get_available_models` | Model collection resource | `conversation model list` | Model picker | Server configuration | Requery | Supported |
| `set_thinking_level` | `conversation.setThinkingLevel` command | `conversation thinking set` | Pinned Pi control | Pi thinking-level entry and settings behavior | Restore from Pi | Supported |
| `cycle_thinking_level` | `conversation.cycleThinkingLevel` command | `conversation thinking cycle` | Pinned Pi shortcut | Same as Pi | Restore from Pi | Supported |
| `get_available_thinking_levels` | Thinking-level collection resource | `conversation thinking list` | Thinking picker | None | Requery | Supported |
| `set_steering_mode` | `conversation.setSteeringMode` command | `conversation queue steering` | `/settings` | Pi settings | Reload setting | Supported |
| `set_follow_up_mode` | `conversation.setFollowUpMode` command | `conversation queue follow-up` | `/settings` | Pi settings | Reload setting | Supported |
| `compact` | `conversation.compact` command | `conversation compact` | `/compact` | Pi compaction entry | Reload compacted branch | Supported |
| `set_auto_compaction` | `conversation.setAutoCompaction` command | `conversation compact auto` | `/settings` | Pi settings | Reload setting | Supported |
| `set_auto_retry` | `conversation.setAutoRetry` command | `conversation retry auto` | `/settings` | Pi settings | Reload setting | Supported |
| `abort_retry` | `conversation.abortRetry` command | `conversation retry abort` | Escape during retry | Receipt and any Pi final state | Reload durable state | Supported |
| `bash` | `conversation.bash` command | `conversation bash run` | `!` or `!!` | Pi `BashExecutionMessage` JSONL | Final result is durable. Live chunks are not replayed | Supported without PTY and without a server temp path |
| `abort_bash` | `conversation.abortBash` command | `conversation bash abort` | Escape during direct bash | Final canceled bash result | Reload final result | Supported |
| `get_session_stats` | Conversation statistics resource | `conversation stats` | `/session` and footer | Derived from Pi JSONL | Recompute | Supported |
| `export_html` | `conversation.exportHtml` command and artifact resource | `conversation export` | `/export` | Server artifact, not conversation state | Completed artifact can be downloaded | Supported with transport difference |
| `switch_session` | `conversation.switch` command | `conversation switch` | `/resume` | Target Pi JSONL remains authoritative | Returns target conversation reference and new stream | Supported with transport difference |
| `fork` | `conversation.fork` command | `conversation fork` | `/fork` | New Pi JSONL session | Returns new conversation reference | Supported |
| `clone` | `conversation.clone` command | `conversation clone` | `/clone` | New Pi JSONL session | Returns new conversation reference | Supported |
| `get_fork_messages` | Fork-message resource | `conversation fork-messages` | `/fork` picker | Derived from Pi JSONL | Requery | Supported |
| `get_entries` | Session-entry resource | `conversation entries` | Internal tree and extension state | Pi JSONL | Requery with durable entry cursor | Supported |
| `get_tree` | Session-tree resource | `conversation tree` | `/tree` | Pi JSONL | Requery | Supported |
| `get_last_assistant_text` | Last-assistant resource | `conversation last-assistant` | `/copy` source | Derived from Pi JSONL | Requery | Supported |
| `set_session_name` | `conversation.setName` command | `conversation name` | `/name` | Pi session-info entry | Reload from Pi | Supported. An empty name clears the manual title |
| `get_commands` | Conversation command collection | `conversation commands` | Slash completion | Resource loader state | Requery after reload | Supported |

The deferred macOS control mapping is outside the first release.

## Session replacement

BITCH never changes the identity represented by an existing conversation URL.

`new_session`, `switch_session`, `fork`, and `clone` return a structured conversation reference. The old SSE stream emits `conversation.replaced` with that reference and then closes normally. The client opens the returned conversation and subscribes to its stream.

`switch_session` accepts a conversation ID scoped to the connected gateway. It never accepts a server file path. Extension cancellation preserves the current conversation and returns `cancelled: true`.

Fork and clone create a new conversation in the same Directory-mode cwd or gateway workspace. The new conversation receives the new Pi session-header ID. The source conversation remains available.

`/tree` changes the active leaf inside one Pi JSONL session and does not change the conversation ID.

## Session statistics

`SessionStats` omits Pi's absolute session file path. Clients show the conversation reference instead. Other pinned statistics remain in `SessionStats`.

## HTML export

Clients do not supply arbitrary server output paths.

Gateway mode writes completed exports below `/data/artifacts/exports/CONVERSATION_ID/`. Directory mode writes them under temporary `/run/bitch/exports/` and streams the result before container shutdown.

The command result returns an artifact ID, file name, media type, byte count, and download URL. Export content follows pinned Pi HTML behavior and the sensitivity rules in [`../operations.md`](../operations.md).

## Shell boundary

BITCH preserves pinned Pi direct shell behavior:

- `!COMMAND` runs non-interactive shell execution and includes its result in later model context.
- `!!COMMAND` sets Pi's `excludeFromContext` behavior.
- RPC bash streams chunks and returns Pi's final `BashResult`.
- shell abort uses Pi process-tree cancellation.
- `shellPath` and `shellCommandPrefix` remain Pi settings.

Shell commands execute inside the selected Agent Server container and use the conversation cwd. They receive no terminal device and do not read client stdin.

`BashResultDto` preserves `output`, `exitCode`, `cancelled`, and `truncated`. It omits Pi's `fullOutputPath` because that temporary server path is not a client resource. Attached JSONL still carries live chunks.

The first release does not create a full-output artifact for direct bash. Missed live chunks are not replayed.

BITCH does not allocate a PTY, suspend the client TUI, or forward arbitrary terminal control sequences. Programs such as `vim`, `htop`, `ssh`, and interactive prompts can fail or produce non-interactive output. Pi's `interactive-shell` example is terminal-only because it requires `ctx.mode === "tui"`. Under BITCH, it observes RPC mode and cannot provide a PTY.

## Edit diff boundary

The pinned Pi `edit` tool returns structured `details.diff`, `details.patch`, and `details.firstChangedLine` data. The Agent Server maps these JSON fields without a terminal renderer.

The TUI renders `details.diff` with the pinned Pi diff component. It preserves Pi line colors, intra-line highlighting, context, and expansion controls. BITCH does not compute a second diff or parse arbitrary tool text.

An extension renderer cannot cross RPC. Extension tools therefore use transferable content or the standard TUI fallback.

## Image attachment boundary

Prompt images use Pi `ImageContent` with base64 data and MIME type. Supported direct MIME types are:

- `image/png`.
- `image/jpeg`.
- `image/webp`.
- `image/gif`.

The client reads a selected local image, validates its declared and detected type, and sends bytes through the typed prompt request. The Agent Server repeats type validation.

The Agent Server applies pinned Pi conversion, orientation, and `images.autoResize` behavior before model use.

Pi JSONL stores accepted image content with its user message. Durable reload restores it. SSE does not repeat image bytes in token events.

Textual `@file` expansion is prompt text behavior, not a durable file attachment. The first release has no general binary file attachment resource, upload store, or non-image attachment protocol.

## Project trust

Directory mode copies pinned Pi 0.83.0 project trust behavior.

Interactive startup uses a process-scoped Directory trust interaction. It preserves pinned Pi trust options and extension decision order.

`/trust` writes the Directory-mode `trust.json`. Newly trusted project resources require a new session or invocation.

Non-interactive Directory mode uses saved trust and `defaultProjectTrust`. `--approve` (`-a`) and `--no-approve` (`-na`) override trust for one invocation. The mode never invents an answer or reads stdin.

Gateway mode treats every managed workspace as trusted. It does not emit a trust request or expose `/trust`. Container mounts, Unix permissions, and Tailnet access form the gateway trust boundary.

## Pi application commands outside the boundary

The first release does not expose Pi package installation, package-update, or Pi self-update commands. The Agent Server image and lockfile own BITCH and pinned Pi dependencies.

Pinned Pi resource loading can still install configured packages under the project-trust policy.

The first release also does not expose `/import`, `/share`, or `/llama`. These operations require file import, third-party publishing, or a model-router lifecycle outside the approved protocol.

The TUI does not advertise these unsupported built-in commands. Extension commands remain subject to pinned Pi name-resolution rules.

## Capability status outside Pi RPC

| Capability | First-release status |
|---|---|
| Pi tools, hooks, commands, skills, prompts, settings, retries, and compaction | Supported |
| Pinned Pi RPC extension UI methods | Supported |
| Pinned Pi provider authentication | Supported through HTTP and the TUI |
| Pinned `/settings` fields | Supported through server persistence or client presentation, according to field effect |
| Terminal-only extension components and renderers | Pi RPC no-op, default, or fallback behavior |
| Direct non-interactive shell | Supported |
| Separate interactive PTY | Unsupported |
| Image attachments | Supported |
| General file attachments | Unsupported |
| Directory project trust | Supported |
| Gateway workspace trust | Always trusted by product policy |
| Pinned `AgentSession.reload()` | Supported as `conversation.reload`, `conversation reload`, and `/reload` |
| Client-owned TUI `/gateway` hub | Deferred with approved local boundary |
| Native macOS controls | Deferred |
