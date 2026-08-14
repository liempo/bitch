# MVP Acceptance Workflows

## Status

Approved MVP acceptance specification. Implementation is pending.

## Purpose

These workflows verify the public completion boundary. Tests use the built CLI, the TUI, or a packaged client against a real daemon.

## 1. Start the local daemon

1. Start from a client installation with no running local daemon.
2. Run the explicit `bitch onboard` command.
3. Decline relay enablement.
4. Wait for daemon readiness.
5. Run the daemon status command.

Expected result:

- Onboarding starts one host-native local daemon.
- The daemon reports one stable ID and its configured listen target.
- The local connection is registered.
- Relay remains disabled.
- The daemon remains running after onboarding exits.

## 2. Run and resume Pi work

1. Create or open a local Workspace for an existing directory.
2. Start a Pi Conversation with a deterministic scripted prompt.
3. Observe normalized user, assistant, and tool timeline items.
4. Disconnect every client while the turn runs.
5. Reconnect after the turn settles.
6. Open the same Conversation.

Expected result:

- The Pi turn continues without clients.
- The Conversation keeps its BITCH identity and native Pi session handle.
- Reconnect loads an authoritative timeline tail.
- Live and fetched rows do not duplicate one another.
- The final state is not falsely running.

## 3. Keep one turn active through a Pi retry

1. Configure the scripted Pi model to return one retryable failure and then a successful response.
2. Start one Conversation turn.
3. Observe Pi's retry interval and final response.
4. Wait for Conversation settlement through the public client.

Expected result:

- The Conversation remains running after the first low-level Pi run ends.
- The client does not report a failed or idle Conversation while Pi will retry.
- The successful response belongs to the original accepted turn.
- Final idle state appears only after Pi reports full settlement.

## 4. Use Pi resources and controls

1. Configure a test Pi extension, skill, and prompt in standard Pi locations.
2. Start a Conversation in the matching Workspace.
3. List and invoke their commands through the client.
4. Select a Pi model and thinking level.
5. Run manual compaction.
6. Request a Pi extension `confirm` or `select` dialog.
7. Resolve it from a client.

Expected result:

- Pi discovers the standard resources.
- Paseo's Pi adapter exposes the transferable commands.
- Model, thinking, and compaction changes reach the Pi process.
- The dialog appears as one daemon question permission.
- One valid response resolves it for all clients.

## 5. Import a standalone Pi session

1. Create a valid standalone Pi JSONL session.
2. Ask the daemon for importable Pi sessions.
3. Import the selected session explicitly.
4. Open the resulting Conversation.
5. Send a new prompt.

Expected result:

- Discovery does not create a Conversation by itself.
- Import creates one BITCH Conversation with the native Pi session path.
- The normalized history is available.
- The recorded model and thinking level are retained when Paseo can read them.
- A new Pi RPC subprocess can continue the session.

## 6. Use multiple Conversations in one Workspace

1. Open one Workspace.
2. Start two Pi Conversations in it.
3. Run both concurrently.
4. Open both as TUI tabs.
5. Create a split and show both panels.

Expected result:

- Each Conversation has an independent Pi RPC subprocess and lifecycle.
- Both use the same Workspace `cwd`.
- Focus, split, move, and resize changes do not alter daemon lifecycle state.
- Closing a root Conversation tab is a separate confirmed archive gesture.

## 7. Reattach a Terminal

1. Create a named Terminal in a Workspace.
2. Run a command that produces screen and scrollback content.
3. Disconnect the client without killing the Terminal.
4. Connect a second client.
5. Subscribe to the same Terminal.
6. Send more input.

Expected result:

- The daemon-owned PTY remains active while no client is attached.
- Subscription receives a current screen and bounded scrollback snapshot.
- Live output continues after the snapshot.
- The second client can send input.
- Output is not duplicated or lost at the snapshot boundary.

## 8. Share a Terminal between clients

1. Attach two clients to one Terminal.
2. Send input from each client.
3. Claim size from the first client.
4. Send an update from the second client without a claim.
5. Claim size from the second client and send another update.

Expected result:

- Both clients can write.
- Both clients observe resulting output.
- The unclaimed second-client resize update is ignored.
- The second claim transfers size ownership.
- Its later update changes PTY size.

## 9. Use multiple same-path Workspaces

1. Create two active Workspaces with the same `cwd`.
2. Put different Conversations and Terminals in each.
3. Open the directory without an explicit Workspace ID.
4. Repeat the operation.

Expected result:

- Paseo's deterministic exact-path rule selects consistently.
- Opening does not create another Workspace only because multiple matches exist.
- Workspace-owned Conversations, Terminals, and layout remain separate.

## 10. Archive local and worktree Workspaces

1. Archive a local Workspace.
2. Verify its directory remains unchanged.
3. Create two Workspaces that refer to one BITCH-managed worktree.
4. Archive the first.
5. Archive the second.
6. Restore the archived managed-worktree Workspace through the daemon's Workspace recovery action.

Expected result:

- Local files are preserved.
- The managed worktree remains while an active Workspace refers to it.
- The final archive removes the managed worktree.
- Persisted placement metadata supports Paseo-native recovery.

## 11. Select a remote daemon directly

1. Register a reachable remote daemon.
2. Select it explicitly.
3. Open a remote Workspace and start Pi work.
4. Make that route unavailable.
5. Attempt another action.

Expected result:

- Every action runs on the selected remote daemon.
- The local daemon does not receive remote work.
- The unavailable remote daemon stays selected and disconnected.
- No fallback action runs elsewhere.

## 12. Pair through the encrypted relay

1. Start with relay disabled.
2. Request pairing and consent to relay enablement.
3. Transfer the pairing offer to another client.
4. Connect through the relay.
5. Run a read and mutation workflow.

Expected result:

- The daemon creates or uses its persistent relay keypair.
- The client authenticates the daemon public key from the pairing offer.
- Application messages use Paseo's encrypted relay channel.
- The relay cannot read plaintext application data.
- Direct and relay routes refer to the same daemon ID.

## 13. Remove and restore localhost

1. Register at least one remote daemon.
2. Start the local daemon through the CLI.
3. Remove the built-in localhost connection from the TUI or registry CLI.
4. Verify that the independently started daemon remains active but is no longer selected or managed by that client.
5. Use the remote daemon.
6. Enable the built-in daemon again.

Expected result:

- The client can operate with remote daemons only.
- Removal does not stop an independently started daemon.
- Removal does not delete local daemon, Pi, Project, Workspace, or filesystem data.
- Re-enablement recovers the preserved local state.

The deferred graphical acceptance workflow separately verifies removal of a desktop-owned managed daemon.

## 14. Stop and restart the daemon

1. Start a Pi turn and a Terminal.
2. Request explicit daemon restart.
3. Reconnect after readiness.
4. Open the Conversation and inspect Terminals.

Expected result:

- Restart ends the Pi RPC subprocess and PTY.
- The interrupted turn is not replayed.
- Durable Conversation metadata and the Pi handle remain.
- The prior runtime-only Terminal is absent.
- Opening the Conversation resumes Pi as needed and rebuilds normalized history from Pi JSONL.
- A later prompt can continue the Pi session in a new process.

## 15. Exclude non-Pi agents

1. Query available agent runtimes.
2. Try a retained Paseo command with a non-Pi provider ID.
3. Inspect public client choices and Terminal creation surfaces.

Expected result:

- Pi is the only available agent runtime.
- The copied multi-agent Terminal profile surface is absent.
- A plain shell Terminal remains available.
- The non-Pi request fails before an external agent starts.
- No public client advertises Claude Code, Codex, Copilot, OpenCode, ACP, or OMP as an agent runtime.
