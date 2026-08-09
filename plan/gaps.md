# Open Planning Gaps

## Purpose

This file groups unresolved questions into decision packets. One primary question should cover all related gap IDs in a packet.

Remove a gap after its answer is documented under `docs/` and reflected in the applicable phase.

## Interview method

Use this sequence when resolving a packet:

1. Inspect the approved BITCH documents and the pinned Pi behavior.
2. Ask one decision question that is not only yes or no.
3. Present practical options with concise benefits and costs.
4. Recommend one option.
5. Explain the recommendation.
6. State which related gap IDs the answer can resolve.
7. Use the answer to draft all related contracts and workflows in the packet.
8. Only when the answer leaves a required product choice unresolved, ask one follow-up.

Do not split a packet into questions about command spelling, schema fields, error codes, or other technical details. Draft those details from the approved product answer and the recommended design.

Do not ask the user to restate standard Pi behavior. Research the pinned Pi documentation and source instead. Ask only about an intentional BITCH difference or a product policy that the approved documents do not define.

## Deferred decision packets

Do not resolve these macOS packets while the CLI and TUI release is the priority. Revisit them only when the native product stage is explicitly opened.

### D04: macOS conversation and Pi-control presentation

**Question scope:** Choose one conversation-screen model for controls, streaming state, failures, reconnection, and extension interaction.

- [ ] **C04** Map deferred macOS controls in the Pi capability matrix.
- [ ] **M02** Define the conversation-screen layout.
- [ ] **M03** Place advanced Pi controls.
- [ ] **M04** Define running and queued presentation.
- [ ] **M05** Define viewed and completed-result presentation.
- [ ] **M06** Define failure presentation.
- [ ] **M07** Define server-restart presentation.
- [ ] **M08** Define reconnection presentation.
- [ ] **M09** Define pending extension-dialog presentation.

### D05: macOS workspace and destructive-action flows

**Question scope:** Choose the native workspace, Trash, restoration, and permanent-deletion interaction model.

- [ ] **M10** Define workspace creation and Trash flows.
- [ ] **M11** Define permanent-deletion warnings.

### D06: macOS verification

**Question scope:** Define the native client test layers and release gates after its behavior is approved.

- [ ] **V09** Define deferred macOS client tests when Phase 7 starts.
