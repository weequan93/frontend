# DeriW frontend deployment

The dev explorer already runs **2.7.2-deriw.4**, compatible with backend
**10.2.6**. This repository is the frontend source; backend, database, proxy,
Redis and the native migration are managed in the separate backend repository.

## Current qualified image

```text
quanquanah/blockscout-frontend@sha256:44bd15d39c839baf1e32e28ce99c63c9eee99db8e08043cc0df8ceb1d84faf28
```

Its original source revision is `d30a3ebe40d6fb6a061a84afed74afe32c8a6abe`.
The new `codex/consolidated-frontend-v272` branch contains the same application
files, squashed into one commit over `origin/deriw-dev`. It changes Git history
presentation and documentation; it does not rebuild or relabel that image.
Existing deployment/source references remain valid. See the
[release manifest](../deploy/release-manifest.json) and
[qualification record](../deploy/upgrades/deriw-footer-three-columns-validation-2026-11-07.json).

| Module | Qualified version / retained behavior |
| --- | --- |
| Upstream frontend | 2.7.2 |
| DeriW release | 2.7.2-deriw.4 |
| Node / Next.js / React | 22.23.4 / 16.2.10 / 19.1.4 |
| Rollup labels | Configured L2 parent / L3 current chain |
| DeriW integration | Separate account/trade API, bounded retries and preserved date filters |
| Footer | DeriW branding and Docs; three desktop columns, two links in each |
| Production source maps | Disabled |

The desktop pairs are Website/Docs, X/Telegram, Discord/Blog. Mobile keeps two
columns and three rows. No unrelated backend/database module is upgraded by a
frontend build.

## Use the server's settings and deployment helper

Use the backend repository's [current operations guide](https://github.com/weequan93/blockscout-deriw/blob/codex/consolidated-v10-release/docs/deployment/dev-v10.md).
There is no frontend deployment to repeat for this squash. On the existing dev
server, the read-only operations checkout provides:

```bash
bash deploy/ops.sh status
bash deploy/ops.sh config-check
bash deploy/ops.sh components
```

A future image change uses the reviewed `v10_frontend_deploy.py` helper from the
backend release. It inherits the latest authenticated Compose snapshot and the
actual runtime environment, validates an isolated candidate, changes only the
frontend, and resumes the same native migration checkpoint. Use the exact
source checkout and private state printed by that operation for recovery.

Preserve the server-private release directories, original environment files,
mounted branding/configuration/certificates and prior source checkouts. Do not
replace them with `.env` examples, copy an old generated icon sprite hash into a
new image, disable environment validation, or run a generic Compose update.
The helper migrates retired setting names while retaining compatible DeriW
values. The private snapshots are configuration/recovery evidence; database
backups remain a separate responsibility.

## Build only when application files change

No new Docker image is needed for this source consolidation. To build the next
candidate, use Node from `.nvmrc`, Yarn 1.22.22 and the committed lockfile.
The [upgrade guide](DERIW_V2_7_2_UPGRADE.md) records the validation commands and
Docker build procedure. Use a distinct image tag and real new source revision,
then qualify the full entrypoint, migrated server settings, pages and browser
behavior before selecting its immutable digest. Update the backend helper's
reviewed image/source allowlist for that candidate; an unreviewed rebuild is not
interchangeable with the already qualified image.

For a different server, configure its own chain/API/RPC/branding inputs and
backend inventory. The existing dev private journals and fixed data paths are
not reusable installation templates.
