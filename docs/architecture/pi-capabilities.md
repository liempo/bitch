# Pi Capability Contract

## Status

Approved MVP capability contract. Implementation is pending.

## Normative sources

BITCH pins `@earendil-works/pi-coding-agent` 0.83.0 for its initial implementation contract. Pi documentation and observable behavior define native Pi semantics.

Paseo source with package version 0.3.1 at commit [`163e7d1`](https://github.com/getpaseo/paseo/tree/163e7d1cc421cdfe4de67b971ff6cea4b51eb0ed) defines the MVP adapter and client presentation boundary. Use the exact commit, not the earlier `v0.3.1` tag.

When Pi exposes behavior that Paseo does not transfer, the MVP follows Paseo and defers the additional capability.

## Runtime boundary

The daemon starts one installed Pi binary in RPC mode for each live Conversation. The copied launch path resolves `PI_COMMAND`, then the legacy `PI_ACP_PI_COMMAND`, then the installed `pi` command.

BITCH does not embed the Pi SDK in the daemon. It does not render the native Pi TUI as a terminal stream.

Pi owns:

- model calls and authentication.
- native model providers.
- tools.
- prompts and message queues.
- retries and compaction.
- extension execution.
- settings and project resources.
- JSONL session state.

The Paseo-derived adapter owns:

- process lifecycle.
- RPC request and event mapping.
- normalized timeline mapping.
- model and thinking presentation.
- question and permission mapping.
- Pi session discovery, import, and resume.
- provider-native persistence handles.

## MVP capability matrix

| Capability | MVP status | Boundary |
|---|---|---|
| Text prompts | Supported | Paseo starts one Pi foreground turn. |
| Image prompts | Supported | Raw images go to vision-capable models. Other cases use a daemon-local path hint. |
| Streaming assistant text and reasoning | Supported | Pi events map to normalized timeline rows. |
| Tool calls and results | Supported | Standard Pi tools map to Paseo tool details. Unknown tools use fallback content. |
| Stop or abort | Supported | Lifecycle changes only after Pi acknowledges or emits terminal state. |
| Client message queue | Supported | The copied client queues follow-up submissions and drains them through the daemon. |
| Direct Pi `steer` control | Deferred | Not a distinct Paseo public control. |
| Direct Pi `follow_up` control | Deferred | Not a distinct Paseo public control. |
| Model discovery and selection | Supported | The adapter queries Pi RPC models and sets provider/model IDs. |
| Thinking-level selection | Supported | The adapter uses Pi RPC thinking controls. |
| Manual compaction | Supported | `/compact` maps to the Pi compact RPC command. |
| Automatic compaction control | Supported | `/autocompact` maps to Pi state and RPC. |
| Pi internal retry | Supported with an adapter fix | The Conversation stays running through Pi retries and settles only on `agent_settled`. |
| Additional auto-retry controls | Deferred | Pi can retry internally. BITCH does not expose every RPC toggle in the MVP. |
| Conversation rewind | Supported | Paseo captures Pi entries and navigates the Pi tree. |
| Full tree browser | Deferred | Not required by the retained Paseo client. |
| Fork and clone parity | Deferred | Not required by the retained Paseo client. |
| Pi session naming parity | Deferred | Paseo Conversation titles remain the MVP presentation. |
| Pi HTML or JSONL export parity | Deferred | Not part of the retained MVP workflow. |
| Pi session statistics and usage | Supported | Pi runtime usage maps into the Conversation snapshot and retained client presentation. |
| Standalone Pi session discovery | Supported | The adapter scans the configured Pi session directory. |
| Explicit session import | Supported | Import creates a BITCH Conversation and timeline. |
| Session resume | Supported | The adapter starts Pi with the persisted session path. |
| Extension commands | Supported | Pi RPC `get_commands` supplies extension commands. |
| Prompt templates | Supported | Pi RPC command discovery and prompt handling. |
| Skills | Supported | Pi RPC command discovery and prompt handling. |
| Extension tools and hooks | Supported | They run inside the Pi subprocess. |
| `select`, `confirm`, `input`, `editor` UI | Supported | Mapped to Paseo question permissions. |
| General `notify` presentation | Limited | Paseo consumes selected notifications for command output and integration markers. |
| Status, widget, and title UI parity | Deferred | Not part of Paseo's retained permission bridge. |
| Custom terminal components | Deferred | Cannot cross the process and daemon protocol boundary. |
| Custom message and tool renderers | Deferred | Clients use normalized content and fallback presentation. |
| Custom editor, theme, footer, header, overlay | Deferred | Terminal-only Pi UI. |
| Project trust | Pi-owned | The installed Pi process applies its standard discovery and trust behavior. |
| Pi login UI through BITCH | Deferred | The user authenticates Pi separately. |
| Pi package management through BITCH | Deferred | Use standalone Pi administration. |
| Paseo Agent MCP injection | Disabled | Pi 0.83.0 has no native `--mcp-config` flag, and MCP orchestration is outside the MVP. |

## Pi 0.83 compatibility boundary

The pinned Paseo source is newer than the pinned Pi contract. BITCH retains only adapter paths verified against `@earendil-works/pi-coding-agent` 0.83.0.

Disable Paseo's Agent MCP endpoint and automatic MCP injection. No MVP launch can pass `--mcp-config` to Pi. A user-installed Pi extension can still provide its own tools or MCP behavior as standard Pi extension behavior, but BITCH does not configure it.

Phase 1 verifies the adapter against the exact Pi 0.83.0 package. Phase 2 cannot accept the copied adapter unchanged because Pi 0.83.0 distinguishes a low-level `agent_end` from final `agent_settled`.

The retained adapter must:

- launch with `--mode rpc`, `--model`, `--thinking`, `--no-session` or `--session`, and explicit `--extension` paths.
- omit unsupported `--mcp-config` and `rpc-ui` launch paths.
- frame input and output as strict LF-delimited JSONL. It can strip one trailing carriage return from a record.
- use Pi's `assistantMessageEvent.delta` values for streamed text and reasoning. Pi 0.83.0 also sends a cumulative `message` snapshot on each update. The adapter must not append that cumulative text as a delta.
- keep a Conversation running when `agent_end.willRetry` is true.
- use `agent_settled` to decide when no Pi retry, compaction retry, or queued continuation remains. The adapter then finalizes the accepted agent turn from the accumulated terminal messages and errors.
- preserve the no-agent command path. A local extension command can complete from its prompt response or notification when Pi reports that it started no agent run. Pi does not emit `agent_settled` for that path.
- keep compaction open until its final event. The copied two-state compaction item cannot represent failure or cancellation, so the adapter must not map those outcomes to `completed`. It must close the loading presentation and expose the error or cancellation through an existing terminal item or a tested minimal protocol extension.
- ignore or safely map Pi events that Paseo does not expose. An unknown Pi event must not crash the daemon.
- continue to use `get_state`, `get_messages`, `get_available_models`, `set_model`, `set_thinking_level`, `get_session_stats`, `get_commands`, `prompt`, `abort`, `compact`, `set_auto_compaction`, and `extension_ui_response`.

A local process probe against the published Pi 0.83.0 package confirmed the launch flags, strict RPC framing, cumulative updates, command discovery, model discovery, dialogs, session state, statistics, and `agent_settled`. The same probe confirmed that a retryable first `agent_end` has `willRetry: true` and is followed by retry events, a final `agent_end`, and `agent_settled`. Full Paseo-adapter acceptance remains a Phase 1 source-import check and a Phase 2 public-daemon integration check.

## Extension discovery

The Pi subprocess uses standard Pi resource discovery from its agent directory and Workspace `cwd`.

BITCH does not load extension code in clients or create a second extension system.

Paseo writes a temporary integration extension and passes it through Pi's explicit `--extension` flag. It captures stable Pi entry IDs, bridges tree navigation, and reports selected command output through RPC UI notifications. BITCH retains and rebrands this adapter behavior. The temporary directory inherits the operating system's private `mkdtemp` permissions and is removed when the Pi session closes. The adapter does not persist the generated source in the daemon home.

## Question mapping

Paseo maps Pi RPC dialog requests to its normalized question permission:

- `select` becomes a single-choice question.
- `confirm` becomes Yes or No.
- `input` becomes free text and can be marked optional from its placeholder.
- `editor` becomes a multiline text question.

A denied question sends a canceled response to Pi. A valid answer sends the matching RPC extension UI response.

## Process failure

A Pi process exit during a turn produces a failed Conversation turn.

A process exit between turns can close or error the Conversation according to the copied adapter behavior. A later open or prompt can resume from the native Pi handle when valid.

Client disconnection does not close Pi. Daemon shutdown does.

## Version changes

A Pi version change must run the Pi adapter behavioral suite. It must verify:

- RPC launch and framing.
- prompt acceptance and event mapping.
- model and thinking controls.
- compaction.
- extension commands and questions.
- import and resume.
- rewind integration extension behavior.
- image handling.
- process exit and cancellation.

Do not add a BITCH-specific Pi capability before the Paseo-native MVP passes.
