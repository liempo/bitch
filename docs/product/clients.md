# Client Behavior

## Status

Approved MVP product specification. Implementation is pending.

## Shared boundary

All clients use one BITCH daemon protocol adapted from Paseo's WebSocket protocol.

The protocol mixes JSON messages with binary terminal frames. Clients do not read daemon storage or Pi JSONL directly. Pi RPC types remain inside the daemon's Pi provider adapter.

The MVP includes a CLI and a TUI. The graphical app, Electron desktop shell, mobile app, and browser app are deferred.

## Daemon registry

Each client keeps a registry of saved daemon connections.

The registry contains a removable local daemon connection by default. A user can also add multiple remote daemon connections.

Each connection records the stable daemon ID and one or more usable direct or relay routes according to retained Paseo behavior. The daemon ID, not a mutable label or endpoint, identifies the host.

Removing the local daemon connection:

- removes that connection from the client.
- disables built-in daemon management for that client.
- stops the local daemon only when the graphical client owns that managed process.
- leaves an independently CLI-started daemon running.
- preserves daemon records, Pi data, Projects, Workspaces, and project files.
- leaves registered remote daemons available.

Enabling the built-in daemon again can recover its preserved state.

## Selection

One client action targets one explicitly selected daemon.

A selected daemon owns every referenced Project, Workspace, Conversation, and Terminal. Client views do not merge resources from multiple daemons.

If the selected daemon is unavailable, the client keeps it selected and shows a disconnected state. It does not execute on the local daemon or another remote daemon.

Changing selection is explicit. It does not move or replicate work.

## CLI behavior

The CLI adapts Paseo's command model and uses the same daemon protocol as the TUI.

The retained MVP command families cover:

- daemon onboarding, start, foreground, status, stop, restart, and pairing.
- daemon route selection, including an explicit remote host.
- Pi Conversation run, attach, inspect, send, wait, stop, archive, reload or auto-unarchive, import, update, and delete through retained commands.
- Workspace create, list, rename, open, archive, and recovery.
- Terminal create, list, capture, send keys, and kill.
- Pi provider and model inspection exposed by Paseo.
- pending question and permission responses.

The CLI uses non-interactive output behavior copied from Paseo. BITCH does not require the old human, JSON, and JSONL contract when Paseo does not provide that exact format.

An ordinary command connects to its selected daemon. It does not start a missing daemon implicitly. The explicit `bitch onboard` flow starts the local daemon when absent. A remote daemon must already run.

A client disconnect or failed network connection does not abort daemon-owned work. An explicit stop action requests cancellation.

## TUI Workspace canvas

The TUI presents one selected daemon and one focused Workspace.

Conversations and Terminals are peer panels. Each panel can appear as a tab or in a user-created split. A user can focus one panel or show Conversation and Terminal panels together.

No permanent split is required. Copy Paseo's nested split-tree limit of four levels.

Panel layout is client-local and persists across client restart. It stores Workspace panel trees and split sizes, not daemon resource state. Closing or moving a Terminal panel only detaches that view. Closing a root Conversation tab follows Paseo's lifecycle gesture and archives the Conversation after the required confirmation. Closing any future child-Conversation view remains layout-only until it is detached or explicitly archived.

The TUI copies Paseo's Workspace canvas behavior. Paseo implements that behavior in its graphical app, so BITCH implements the terminal presentation with the Pi 0.83.0 distribution's `@earendil-works/pi-tui` package. The TUI uses Pi's component library only. It does not run Pi's native interactive mode.

The TUI must not load Pi extension modules. Extensions execute in the daemon-owned Pi subprocess. The TUI presents normalized timeline items and supported question permissions.

## Conversation presentation

Clients show Paseo's normalized Conversation lifecycle and attention state. The daemon remains authoritative.

On open or reconnect, a client:

1. connects to the selected daemon.
2. starts live Conversation delivery.
3. loads the current Conversation snapshot and latest authoritative timeline tail.
4. fetches forward pages when it detects a sequence gap.

The client keeps live rows received during bootstrap separate until it reconciles them with the authoritative tail.

A short local display cache can render before synchronization. It cannot accept mutations or establish authority.

## Terminal presentation

The daemon owns each PTY. A client subscribes through Paseo's binary terminal stream.

Subscription restores a daemon-produced screen and bounded scrollback snapshot. Live output then continues through binary output frames.

Multiple clients can observe and write to one Terminal. The MVP does not add a writer lease.

Terminal size follows Paseo's claim model:

- focus or direct interaction can claim size ownership.
- the owner can send later geometry updates.
- another connection's update is ignored until that connection sends a claim.
- a later valid claim transfers ownership.

A passive attach or render does not claim size only because the panel is visible.

## Local daemon lifecycle

The explicit `bitch onboard` flow starts a detached host-native daemon when needed.

The CLI also provides explicit lifecycle commands. A CLI-started daemon remains running after the CLI exits.

The future graphical client can manage a daemon subprocess. It starts and stops only the daemon that it owns. This behavior is deferred with that client.

An explicit stop or restart affects all connected clients and ends daemon-owned Pi processes and PTYs. The MVP does not add a shutdown veto or control lease.

## Remote connection behavior

Remote daemon support is required in the MVP.

BITCH retains Paseo's two connection paths:

- direct WebSocket access over a user-secured network route.
- an outbound encrypted relay route established through pairing.

The relay is disabled until the user consents to enable it. Pairing transfers the daemon public key. Relay traffic uses Paseo's end-to-end encrypted channel.

An unencrypted direct connection must stay on a trusted local network or VPN. Password authentication controls access but does not encrypt direct traffic.

## Deferred clients

The macOS desktop phase should use Paseo's shared-app and Electron structure as its primary reference. That stage can also establish the shared app foundation for later iOS support.

Desktop, mobile, and browser work does not block the CLI and TUI MVP.
