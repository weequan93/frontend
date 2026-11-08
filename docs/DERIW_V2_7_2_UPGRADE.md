# DeriW frontend v2.7.2 upgrade history

The final `.4` image is deployed on dev. Start with the
[current deployment guide](DERIW_DEPLOYMENT.md); the earlier images and commands
below are retained as build/recovery history, not pending rollouts.

## Three-column footer

`2.7.2-deriw.4` arranges the desktop links in three columns, with two links in
each column:

| Column 1 | Column 2 | Column 3 |
| --- | --- | --- |
| DeriW website | X | Discord |
| Docs | Telegram | Blog |

Mobile retains two columns and three rows. The source revision is
`d30a3ebe40d6fb6a061a84afed74afe32c8a6abe`. The Linux AMD64 image reference is:

```text
quanquanah/blockscout-frontend@sha256:44bd15d39c839baf1e32e28ce99c63c9eee99db8e08043cc0df8ceb1d84faf28
```

The [three-column validation record](../deploy/upgrades/deriw-footer-three-columns-validation-2026-11-07.json)
records the layout, build, startup and registry checks. Use the backend's
`release/v10-footer-columns` rollout tools to deploy it while preserving the
existing native migration checkpoint. Publication does not deploy the server.

## Previous two-column footer

`2.7.2-deriw.3` puts all six DeriW links into the default footer grid with two
columns and three rows, including Docs at `https://docs.deriw.com/`. The rows
are Website / Docs, X / Telegram, and Discord / Blog. Desktop and mobile use the
same arrangement. The rollout removes the earlier configurable Docs copy and
its empty Resources group while preserving other custom links.

This image uses source `8c7bfddd732365f6cc8963bf9d214ee69735eeca`.
The qualified Linux AMD64 reference is:

```text
quanquanah/blockscout-frontend@sha256:7ff6969bbd76991dc84432515ab56364fa314361796258969f7e70223ffbbd66
```

The [grid validation record](../deploy/upgrades/deriw-footer-grid-validation-2026-11-07.json)
records the existing layout checks, production build, full startup and branding
checks, and migration checkpoint preservation checks in the rollout helper.
The `.2` records below describe the previous qualified footer image.

## DeriW footer patch

`2.7.2-deriw.2` replaces the upstream footer branding with the existing DeriW
network logo, a short description, DeriW copyright, and the official website,
X, Telegram, Discord and blog links. The description is adapted from the
[official DeriW website](https://www.deriw.com/): “DeriW is a decentralized
perpetual exchange offering gas-free on-chain trading.” Community destinations
were checked against that site's footer on 7 November 2026.

The visible footer no longer includes Blockscout promotions, credits, or backend
and frontend version hashes. Image revision/version metadata remains available
for deployment verification. The repository's upstream license is retained.
Existing custom footer link groups, network wallet controls and indexing alerts
continue to work. The footer uses a DeriW text fallback if its network logo
cannot load.

The rollout configures a **Docs** link to [DeriW documentation](https://docs.deriw.com/)
through the existing `NEXT_PUBLIC_FOOTER_LINKS` setting. It appears under
Resources by default and preserves any current custom link groups. This uses
the same qualified `.2` image and does not require another Docker build.

This is a frontend image change. Deploy it through the frontend rollout helper
with its own reviewed revision and immutable digest; preserve the currently
active image and private journal for rollback. The original `.1` build and
digest below remain the historical initial upgrade reference.

This branch upgrades the upstream UI from the August 2025 fork base to
**v2.7.2**, while retaining the Deriw account/trade integration and backend
**v10.2.6**. It retains the v2.7.2 GPLv3 license. It does not apply backend
migrations or change a running explorer.

| Source | Commit |
| --- | --- |
| Upstream v2.7.2 | `446c409eeb54274aab90ff371a705f9699cd84ef` |
| Original Deriw frontend | `25ccfdbb744365d9005e0e7b7adb16c171a4f7fd` |
| Common upstream fork base | `bed90dbd672dfd02caac01a1d4816128a393b466` |

The initial upgrade build identifies itself as `2.7.2-deriw.1`. The runtime remains **Next.js
16.2.10**, with **React 19.1.4** and **Node 22.23.4**. Upstream v2.7.2 uses
Next.js 15; this candidate keeps the working Deriw Next.js 16 port, the
`proxy.ts` convention and explicit Webpack build. Node selection is consistent
across `.nvmrc`, package engines, Docker stages and CI. Image labels record the
release version and the supplied source revision.

## Qualified DeriW footer image

The footer patch uses source `8fbbb5f6742ab474cbcdaded0beb23cbdd89e2dc` and
version `2.7.2-deriw.2`. Its qualified Linux AMD64 reference is:

```text
quanquanah/blockscout-frontend@sha256:5e4aa57fd687f25e98a145c83d4681ad32be2b13af6c77b3ac0c0d4501b20b56
```

The [footer validation record](../deploy/upgrades/deriw-footer-validation-2026-11-07.json)
records 13 browser layout checks, TypeScript/lint, the production build and full
container/branding startup checks. This build used a 3 GiB Node heap through
`--build-arg BUILD_NODE_OPTIONS=--max-old-space-size=3072`.
Use the latest frontend rollout helper in a separate pinned worktree. It
retains the earlier `.1` frontend receipt, uses that qualified Compose snapshot
for the next selection, and preserves the same normalization cursor/token.
Existing completed normalization stays completed.

## Reconciled Deriw changes

| Original commits | Result |
| --- | --- |
| `25c780b38`, `18f03ad24`, `25ccfdbb7` | Framework updates reconciled with the v2.7.2 dependency set, retaining Next.js 16 and refreshing Node/React. |
| `f52157bba`, `1b9201f2a` | Manual parent/current-chain relabeling replaced by upstream's configurable rollup layer labels. |
| `4477e50d0` | Short date presets and the 31-day custom range retained on the upstream shared filter component. |
| `ca694df4e` | Separate Deriw account/trade API, account value and transaction trade rows retained. Trade rendering is isolated from upstream transaction details. |
| `86d2c70e1`, `03395e2bf`, `5522f36e4` | Custom loading states retained using current upstream components and an empty trade placeholder. |
| `84590b196` | HTTP 500/503 retries and polling stop for Deriw requests. General backend requests retain upstream's bounded recovery retries. |
| `cc13415bf` | Production browser source maps remain disabled. |

Account value retains the existing calculation: Deriw `sum_account_value` plus
the configured token balance. Token amounts are converted with decimal
arithmetic before summing. Invalid addresses and an unset Deriw integration do
not start custom API/RPC queries. Failed Deriw requests do not expose the
original debug logging of API response/error objects.

Absolute timestamps remain the default, now respecting the upstream Local/UTC
setting. Existing general transaction, deposit and withdrawal APIs continue to
use the Blockscout backend; the Deriw API remains a separate optional service.

## Prepare the environment

Use a new server-private environment selection for the candidate. Preserve the
existing environment and image for recovery. Do not publish resolved environment
files, credentials or private API configuration in Git or chat.

1. Set `NEXT_PUBLIC_ROLLUP_TYPE=arbitrum` and
   `NEXT_PUBLIC_ROLLUP_LAYER_NUMBER=3`. Upstream then labels the parent as L2 and
   Deriw as L3 throughout deposits, withdrawals, batches and transaction details.
2. Put the existing parent explorer details in
   `NEXT_PUBLIC_ROLLUP_PARENT_CHAIN`, including a nonempty `baseUrl` and its
   existing name. Remove `NEXT_PUBLIC_ROLLUP_L1_BASE_URL`; upstream retired that
   alias. Preserve the parent's other existing JSON properties.
3. Remove `NEXT_PUBLIC_API_SPEC_URL`. This release obtains API specification
   identity from the backend configuration endpoints.
4. Preserve `NEXT_PUBLIC_DERIW_API_HOST`,
   `NEXT_PUBLIC_DERIW_API_BASE_PATH`, and `NEXT_PUBLIC_DERIW_USDT_ADDRESS` from
   the current frontend selection. The token field is optional; when supplied,
   it must be a 20-byte EVM address.
5. Preserve existing branding, chain ID, RPC, proxy/API paths, ports and other
   compatible settings. Leave cross-chain/multichain integrations disabled
   unless their required services are actually deployed.

The startup validator remains enabled and rejects unknown settings. Do not set
`SKIP_ENVS_VALIDATION=true` to get an old environment through startup.

## Local validation

Use the Node version in `.nvmrc` and Yarn 1.22.22:

```bash
yarn install --frozen-lockfile
yarn chakra:typegen
yarn lint:tsc
yarn test:vitest run
yarn lint:eslint
yarn playwright install chromium webkit
yarn test:pw:local --project=default --project=mobile --reporter=line ui/tx/details/TxDetailsDeriw.pw.tsx ui/pages/ArbitrumL2Deposits.deriw.pw.tsx ui/address/AddressDetails.deriw.pw.tsx
yarn build
```

Lifecycle scripts are required by some native dependencies. An initial
`--ignore-scripts` install alone is insufficient for the production build.
If reusing such an installation, run
`yarn install --frozen-lockfile --force` to rerun dependency lifecycle scripts.
Browser tests use local mocks and do not call the dev explorer or trade API.
The production bundle has separate checks from the component browser tests.

The dated [source validation record](../deploy/upgrades/deriw-v2.7.2-validation.json)
records the source checks. The subsequent
[Docker validation record](../deploy/upgrades/deriw-v2.7.2-docker-validation.json)
records the successful Linux AMD64 build, full container startup, settings
migration, native dependency import and strict invalid-token rejection.
The build reports an optional MetaMask SDK
dependency warning for `@react-native-async-storage/async-storage`; wallet flows
still need validation with the deployment environment. The container checks use
synthetic settings; the actual server settings are staged before activation.

## Build a candidate image

The published candidate uses source `27a4139d09ac57d975cc8c2bd4f1d804c8589f20`.
To rebuild that source from committed files, choose a distinct candidate tag:

```bash
FRONTEND_REVISION=27a4139d09ac57d975cc8c2bd4f1d804c8589f20
FRONTEND_BUILD_STAMP=$(date -u +%Y%m%dT%H%M%SZ)
FRONTEND_CANDIDATE="quanquanah/blockscout-frontend:deriw-v2.7.2-${FRONTEND_REVISION:0:12}-rebuild-${FRONTEND_BUILD_STAMP}"
git archive --format=tar "$FRONTEND_REVISION" | docker buildx build --platform linux/amd64 \
  --build-arg GIT_COMMIT_SHA="$FRONTEND_REVISION" \
  --build-arg GIT_TAG=v2.7.2-deriw.1 \
  --tag "$FRONTEND_CANDIDATE" --load -
```

This builds locally; it does not push or activate the image. Inspect the
resulting version/revision labels and record the platform-specific registry
digest when publishing a reviewed candidate. Do not overwrite the moving `dev`
tag used by the current explorer as part of candidate preparation.

The Docker build defaults to a 4 GiB Node heap and two Next.js workers, with
Webpack compilation in a separate worker and memory optimizations enabled.
Allocate at least 8 GiB to Docker Desktop for this build. On a larger builder,
`--build-arg BUILD_NODE_OPTIONS=--max-old-space-size=8192` increases the heap.
These settings follow the [Next.js memory guidance](https://nextjs.org/docs/app/guides/memory-usage).

## Live rollout boundary

The tested image is published as:

```text
quanquanah/blockscout-frontend@sha256:76a170d12b74183e3df77dbfa4d047aa0937ad66ed43615ca0d278b4c67429a9
```

Use the backend repository's
[frontend rollout helper and guide](https://github.com/weequan93/blockscout-deriw/blob/release/v10-frontend-deploy/docs/deployment/frontend-v2.7.2.md).
It stages the current settings, pauses the same normalization job, updates only
frontend, verifies it, and resumes that job with a new runtime binding. It keeps
the old image and environment for rollback. A fresh rebuild needs separate
qualification; the reference above identifies the image that passed these checks.

The dev server's native normalization service is bound to the exact existing
Compose containers. Recreating `frontend` changes that evidence, even though
this upgrade requires no database schema migration. The backend's current
bridge-only deployment helper does not deploy this frontend or authorize a
new runtime binding.

A frontend rollout needs a reviewed handoff: pause the same native job, verify
its writer exited and its cursor/token remain intact, select the candidate
image and migrated environment, recreate only frontend, test it, then bind and
resume the same job against the verified runtime. Keep the backend controller
checkout pinned and preserve all private journals. Do not run a blanket Compose
upgrade or restart the backend to deploy this UI.

Before accepting a rollout, check deposits and withdrawals, parent explorer
links, account/token value, trade row expansion, date filtering, timestamps,
contract interaction, source-map restrictions and recovery to the saved image.
The frontend cannot reconstruct missing deposit origination metadata; the
backend bridge tracker supplies that data.
