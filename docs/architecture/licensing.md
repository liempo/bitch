# Licensing and Source Provenance

## Status

Approved conservative engineering policy for the initial Paseo source import. A qualified reviewer must approve the legal interpretation before public distribution.

## Scope

This policy applies to Paseo source with package version 0.3.1 at upstream commit [`163e7d1`](https://github.com/getpaseo/paseo/tree/163e7d1cc421cdfe4de67b971ff6cea4b51eb0ed). This commit is 30 commits after the `v0.3.1` tag. The commit, not the tag, defines the imported content.

The pinned tree contains two license signals:

- the root `LICENSE` says that Paseo content is available under “AGPLv3” and includes the GNU Affero General Public License version 3 text.
- the root `package.json` declares `AGPL-3.0-or-later`.

The pinned README uses the deprecated SPDX identifier `AGPL-3.0`. SPDX deprecated this identifier because it does not state a later-version choice. The upstream repository does not resolve the conflict.

## Conservative interpretation

BITCH does not use the package metadata to expand an ambiguous grant.

For copied Paseo material, BITCH uses the SPDX expression `AGPL-3.0-only`. This expression records the narrow version that all pinned signals clearly permit: GNU AGPL version 3.

BITCH must not label copied Paseo material `AGPL-3.0-or-later` unless an authoritative upstream notice or copyright-holder clarification grants that option for the pinned material.

A later Paseo relicense does not change the pinned source automatically. BITCH can adopt later terms only after it verifies coverage for every copied contribution.

## Repository license

Before the first source import, copy the pinned Paseo `LICENSE` byte for byte to the root `LICENSE`. Keep its copyright and third-party-components notice intact.

The root package and each distributed BITCH package that contains or forms one program with copied Paseo material must declare:

```text
AGPL-3.0-only
```

New BITCH code in that combined program uses the same license. Do not add a conflicting repository-wide license.

A separate third-party component keeps its own license when the component remains identifiable and its original terms apply. Record that component in the third-party notice inventory.

## Required notices

Before copying source, add `NOTICE.md` with:

- the BITCH project name and BITCH copyright notice.
- the Paseo project name and `Copyright (c) 2025-present Mohamed Boudra`.
- the upstream repository URL.
- the exact pinned commit.
- a truthful dated source status. Before package source import, state that no Paseo package source is present. The first import must replace this status with a prominent statement and its actual first modification date.
- a link to the maintained source inventory.
- a link to the root `LICENSE`.
- notices for identifiable third-party material copied with Paseo.
- the corresponding-source URL for the distributed BITCH version.

Do not imply that Paseo, Mohamed Boudra, or Paseo contributors endorse BITCH.

## Source inventory

Maintain one machine-readable inventory at `provenance/paseo-0.3.1.json`. Each entry records:

- the BITCH destination path.
- the upstream path.
- the upstream commit.
- whether the file is copied, renamed, or adapted.
- the upstream Git blob ID.
- the imported file SHA-256 value.
- the applied license expression.
- any file-specific third-party notice.

Record all imported package files and root support files. Do not use a broad directory statement as the only inventory.

The inventory check fails when:

- an imported file has no inventory entry.
- an inventory path is missing.
- the upstream commit differs from the approved pin.
- a copied third-party notice is missing.
- a distributed package has missing or inconsistent license metadata.

Generated outputs do not need one entry per generated file when the inventory identifies their source and generation command.

Maintain `provenance/paseo-authors.txt` as a deterministic snapshot of author identities from the selected upstream path histories through the pinned commit. This file preserves historical attribution after the independent source copy. It is not a claim that each listed identity owns every copied file.

## Modification notices

The root `NOTICE.md`, Git history, and source inventory provide the repository-level notice that BITCH modified Paseo material and the relevant modification dates required by AGPL section 5.

Preserve an existing source-file copyright or license header. Do not remove an upstream author notice. Add a local file header only when the upstream file already uses headers or a file-specific license requires one.

## Distribution and network use

The copied server tree contains a bundled `silero_vad.onnx` file with no adjacent notice in the pinned tree. Exclude this file from the first import until its exact origin, checksum, and required notice are verified. Dormant voice code can remain only if it builds and tests without that unverified binary.

Paseo's root license says that third-party components keep their original licenses. The npm lockfile license fields help discovery, but they are not sufficient notice evidence. Verify distributed dependency notices from the installed package contents and package artifacts.

A source release includes:

- the root `LICENSE`.
- `NOTICE.md`.
- the source inventory.
- the complete corresponding source and build scripts for distributed AGPL-covered object code.
- all required third-party license texts and notices.

A packaged CLI, TUI, daemon, or later desktop app must provide a documented way to view its license, modification notice, and corresponding-source location. An interactive interface must show the appropriate legal notices when AGPL section 5 requires them.

If BITCH provides remote network access to a modified AGPL-covered daemon, that running version must prominently offer every remote user no-charge access to its Corresponding Source through a standard copying method. A repository homepage without a version-specific source path is not sufficient evidence by itself.

## Import gate

Paseo source import can start only after the repository contains:

1. the root `LICENSE` with the pinned Paseo text.
2. root package metadata with `AGPL-3.0-only`.
3. `NOTICE.md` with the required attribution and modification statement.
4. the source-inventory schema and check.
5. the selected-path author snapshot and its generation check.
6. the third-party notice inventory and check.

If a copied file has an unclear or incompatible third-party origin, exclude it until the license is verified or replace it independently.
