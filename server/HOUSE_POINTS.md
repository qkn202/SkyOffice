# House points and weekly Galleons

The first release supports **manual House awards only**. The API verifies the Firebase ID token, checks the server-side `HOUSE_POINT_GRANTOR_UIDS` allowlist, and writes an immutable event plus weekly aggregates to Firestore. Client-provided names, Houses, or role flags are never used to authorize a grant.

## Server configuration

Configure these variables on the SkyOffice server. Never commit a service-account private key.

- `HOUSE_POINTS_ENABLED`: defaults to off. Set to `true` only when enabling this feature with working Admin credentials. While off/unconfigured, both API endpoints return HTTP 503 without starting Firebase; multiplayer remains available.
- `HOUSE_POINT_WEEKLY_JOBS_ENABLED`: defaults to off. Set to `true` separately to enable weekly roster snapshots and rewards. Enabling manual points alone does not start payouts.
- `FIREBASE_PROJECT_ID`: defaults to `hpvnn-archive`.
- `FIREBASE_SERVICE_ACCOUNT_JSON`: service-account JSON as a secret, or use Google Application Default Credentials through `GOOGLE_APPLICATION_CREDENTIALS` / the runtime service account.
- `FIREBASE_USE_APPLICATION_DEFAULT`: set to `true` to explicitly use locally configured ADC when no credentials path is supplied. Cloud Run / App Engine runtime credentials are detected automatically. Credentials are checked before opening Firestore.
- `HOUSE_POINT_GRANTOR_UIDS`: comma-separated Firebase UIDs that may grant points, for example `uid-a,uid-b`. An empty value means nobody can grant points.
- `HOUSE_POINT_WEEKLY_GRANTOR_CAP`: weekly points an authorized person can issue; defaults to `100`.
- `WEEKLY_GALLEON_REWARD_PER_MEMBER`: Galleons per eligible member in each winning House; defaults to `100`. Set to `0` to disable payouts while keeping the leaderboard active.

The service uses the existing `shout_users` Firestore profiles to snapshot House membership for the new week. Members must have a verified Firebase profile with a valid House at the snapshot time. When points, weekly jobs, and Admin credentials are all configured, a server job snapshots membership and settles the previous week; tied top Houses are co-winners and each receives the configured per-member reward. Wallet balances and payout records are written transactionally and keyed by week/member to prevent duplicate payouts.

## Firestore collections

- `house_point_events`: audit trail for manual awards.
- `house_point_weekly_totals`: weekly leaderboard aggregates.
- `house_point_grantor_caps`: per-grantor weekly limit counters.
- `house_point_weekly_rosters` / `house_point_weekly_members`: membership snapshot for each competition week.
- `house_point_weekly_settlements`: settlement state and winning House(s).
- `galleon_wallets` / `galleon_ledger`: current balance and payout history.

The automatic game/task award endpoint is deliberately not included yet. Add it only after game completion can be verified server-side; the game iframe's query parameters and client-reported winner are not trusted proof.
