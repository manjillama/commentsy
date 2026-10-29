<p align="center">
  <a href="https://github.com/manjillama/commentsy">
    <img height="64" src="https://raw.githubusercontent.com/manjillama/commentsy/dev/public/commentsy.svg" alt="Commentsy logo" />
    <img height="64" src="https://raw.githubusercontent.com/manjillama/commentsy/dev/public/commentsy-text.svg" alt="Commentsy" />
  </a>
</p>
<p align="center">Add comments to your website in just a few minutes.</p>

Commentsy is an embeddable comment widget with guest posting, signed-in author controls, GIFs, moderation, and customizable light and dark themes.

**This is a pilot project.** For your own deployment, fork and self-host it.

## Contents

- [What you can do](#what-you-can-do)
- [Local setup](#local-setup)
- [Integrating a site](#integrating-a-site)
- [Environment variables](#environment-variables)
- [Development checks](#development-checks)
- [Project structure](#project-structure)
- [How the data fits together](#how-the-data-fits-together)
- [Abuse controls and data consistency](#abuse-controls-and-data-consistency)
- [Production diagnostics](#production-diagnostics)
- [Current limitations](#current-limitations)
- [Contributing](CONTRIBUTING.md)

## What you can do

| For site owners | For readers |
| --- | --- |
| Add a comment widget using two snippets. | Post text, a GIF, or both. |
| Manage multiple sites from a dashboard. | Comment as a guest or sign in. |
| Moderate comments and optionally approve guest submissions. | Edit and delete comments posted while signed in. |
| Customize colors for light and dark mode. | Revisit signed-in comments across sites from the dashboard. |

## Local setup

### Requirements

- **Node.js and npm.** Docker and CI currently target Node.js 18.
- **MongoDB Atlas or another MongoDB replica set.** Comment writes use transactions; standalone MongoDB servers are not supported.

The app uses Next.js 13, NextAuth 4, React, TypeScript, Tailwind CSS, and Mongoose. Unit tests can run without a database.

### 1. Install

```bash
git clone https://github.com/manjillama/commentsy.git
cd commentsy
npm ci
cp .env.local.example .env.local
```

### 2. Configure

Set these values in `.env.local`:

```dotenv
MONGODB_URI=<your-development-replica-set-connection-string>
NEXTAUTH_SECRET=<your-generated-session-secret>
NEXTAUTH_URL=http://localhost:3000
SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Generate a session secret with:

```bash
openssl rand -base64 32
```

Keep the secret stable between deployments. For other settings, see [Environment variables](#environment-variables).

### 3. Start

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and create an email/password account at `/signup`.

**Google and GitHub login are optional.** Both buttons are registered, but each provider needs its own credentials before it will work. See [OAuth setup](#oauth-setup).

### Using Docker instead

After configuring `.env.local`:

```bash
docker compose up --build
```

Compose loads the environment file, mounts the source, and exposes port 3000. It runs the development server and **does not start MongoDB**. Use a database reachable from the container; `localhost` inside the container refers to the container itself.

## Integrating a site

### Add the widget

1. Open `/dashboard` and create an app in **Your sites**.
2. Add your host site's exact origin to **Authorized domains**. Include the protocol and port, for example `http://localhost:5500`. Omit paths and trailing slashes.
3. Open the app's integration page and copy **both** snippets to your host page: the iframe and the JavaScript. The script shares page metadata and resizes the widget.
4. Replace `{{IDENTIFIER}}` with a stable page identifier, such as a post slug. Use a different identifier for each conversation; keep it stable when the page URL changes.
5. Set `theme=light` or `theme=dark`, or omit the parameter to follow the visitor's device preference.

Origins match exactly. Add both `https://example.com` and `https://www.example.com` if your site serves both.

### Customize and moderate

| Page | Use it to |
| --- | --- |
| **Appearance** | Customize each theme's colors. |
| **Comments** | Review, approve, delete, or mark comments as spam. |
| **Settings** | Update site details, authorized origins, and guest approval. |

Enable **Require approval for guest comments and replies** to hold new guest submissions for review. This is off by default. Changing the setting does not automatically approve existing pending submissions.

The app's integration page provides your generated snippets. The `/docs` page covers integration, identifiers, themes, moderation, and troubleshooting.

**Updating an existing embed?** Replace its JavaScript snippet to receive the message origin/source checks added to newer snippets.

### Embedded sign-in and Safari

1. Sign in to Commentsy in a separate tab.
2. Return to the widget and select **Already signed in? Connect**.
3. Allow browser storage access if prompted.

The widget checks the session without clearing the draft. Guest posting remains available if storage access is denied.

External return destinations must appear in the operator's `AUTH_REDIRECT_ORIGINS` allowlist. Otherwise, sign-in returns to Commentsy.

#### Local testing

Use the same hostname everywhere, for example `http://localhost:5500` for the host page and `http://localhost:3000` for Commentsy. Sign in using that Commentsy hostname too. Do not mix `localhost`, `127.0.0.1`, and LAN IPs.

| Environment | Session cookie | What to test |
| --- | --- | --- |
| Local HTTP | `SameSite=Lax` | Same-hostname integration on different ports. |
| Production HTTPS | `SameSite=None; Secure` | Real cross-site embedded sign-in, including Safari. |

Storage-access approval alone does not override SameSite restrictions. Test cross-site authentication with HTTPS on both sites.

#### Sandboxed iframes

If you sandbox the iframe, include:

```text
allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-storage-access-by-user-activation
```

The host's Permissions Policy must also permit storage access. See the [Storage Access API guide](https://developer.mozilla.org/en-US/docs/Web/API/Storage_Access_API/Using).

## Environment variables

Keep `.env.local` private. Variables prefixed with `NEXT_PUBLIC_` are included in the browser bundle and must not contain server secrets.

### Required settings

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | MongoDB replica set connection string. |
| `NEXTAUTH_SECRET` | Private session secret; keep it stable between deployments. |
| `NEXTAUTH_URL` | Canonical Commentsy origin; also controls session cookie settings. |
| `SITE_URL` | Server-side Commentsy origin; used as the development embed referrer fallback. |
| `NEXT_PUBLIC_SITE_URL` | Public browser-facing origin for links, metadata, and embed snippets. Required when building. |

Set all three URL variables to the same Commentsy origin, without a trailing slash.

- Restart the dev server after environment changes.
- Rebuild deployments after changing public variables.
- Let Next.js manage `NODE_ENV`; do not force it to `test` when running the app normally.

### Optional settings

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_KLIPY_API_KEY` | Public browser key for the [GIF picker](#optional-gif-picker). |
| `AUTH_REDIRECT_ORIGINS` | Operator-managed, comma-separated exact origins allowed after sign-in, such as `https://blog.example.com`. |
| `RATE_LIMIT_IP_HEADER` | Client-IP header overwritten by a trusted proxy. See [Client identification](#client-identification). |
| `LOG_LEVEL` | Server log threshold. Defaults to `info`; use `debug` for additional diagnostics. |
| `MONGODB_URI_TEST` | Replica set URI to enable [database integration tests](#database-integration-tests). |

Legacy `CORS_WHITELISTS`, `CRYPTO_SECRET`, and `CRYPTO_IV` entries remain in `config/keys.ts`. No current feature consumes them; they are not required.

### OAuth setup

Create a GitHub OAuth App and/or a Google OAuth **Web application** client.

| Provider | Environment variables | Local callback URL |
| --- | --- | --- |
| GitHub | `GITHUB_ID`, `GITHUB_SECRET` | `http://localhost:3000/api/auth/callback/github` |
| Google | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | `http://localhost:3000/api/auth/callback/google` |

Use `http://localhost:3000` as the local application/homepage URL where requested. For deployment, replace it with your HTTPS origin in both the provider settings and environment variables.

Accounts are not automatically linked by email. Sign in using the provider the account was created with.

### Optional GIF picker

Create a browser API key in the [KLIPY Partner Panel](https://partner.klipy.com) and set `NEXT_PUBLIC_KLIPY_API_KEY`. Configure content filtering there and leave ads disabled for the GIF-only picker. Check [KLIPY's documentation](https://docs.klipy.com/) for testing limits and production approval requirements.

Without a key, text posting works and saved GIFs remain visible.

Searches, media requests, and search/share reporting go directly from the browser to KLIPY. Reporting uses an anonymous per-page identifier rather than account details. Commentsy stores the selected GIF's metadata and original media URL, not the GIF file.

## Development checks

### Local checks

Run all local checks with `npm run check`, or run them individually:

```bash
npm run lint
npx tsc --noEmit --incremental false
npm test
```

Unit tests exercise actual services and schemas with mocked database/provider calls. They require no `.env.local`, database, OAuth credentials, or GIF API key.

Suites cover comments, GIFs, authentication, embedded sessions, page metadata, dashboard/account settings, logging, and pilot safeguards. To run one suite:

```bash
node --test tests/comments.test.cjs
```

### Database integration tests

Supply a replica set URI explicitly to enable the optional real-database suite:

```bash
MONGODB_URI_TEST='mongodb://127.0.0.1:27017/?replicaSet=rs0&directConnection=true' npm test
```

Without `MONGODB_URI_TEST`, this suite is skipped.

The suite creates a random `commentsy_test_...` database and drops only that database afterward. The database account needs permission to create test databases.

It verifies concurrent comment/reply counts, transaction rollback, repeated deletion, pending approval, and shared rate-limit buckets.

### Continuous integration

GitHub Actions runs lint, TypeScript, and all tests on pushes and pull requests. It starts an isolated MongoDB replica set for integration tests. The **Tests** workflow can also be started manually.

### Production build

With the required environment configured:

```bash
npm run build
npm start
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the development workflow, browser checks, and review checklist.

## Project structure

| Path | Responsibility |
| --- | --- |
| `app/` | App Router pages and layouts: dashboard, account, site settings, and embeds. |
| `app/api/` | HTTP handlers for authentication, apps, comments, moderation, and account settings. |
| `components/embed-comments/` | Embedded forms, GIF picker, author controls, and browser session access. |
| `components/account/`, `components/appearance/` | Account and theme editors. |
| `services/` | Database operations and business rules, including ownership checks. |
| `models/`, `interfaces/` | Mongoose schemas and TypeScript data contracts. |
| `lib/` | Database/model helpers and KLIPY browser client. |
| `utils/` | API wrapper, validation, logging, cookies, sessions, and error handling. |
| `context/`, `store/`, `slices/` | Session providers and Redux state for the app list. |
| `tests/` | Feature suites, integration tests, and shared TS-loading/mocking helpers. |

## How the data fits together

| Model | Role |
| --- | --- |
| **User** | Owns apps and signed-in comments. Guest details live on individual comments. |
| **App** | One website integration, with an owner, public embed code, authorized origins, and serialized theme colors. |
| **Group** | A conversation identified by an app and a page identifier. Created by the embed when needed. |
| **Comment** | Belongs to an app and group. A `parent` reference makes it a reply. Supports text, one GIF, or both. |

### Reading and writing comments

- The embed reads through `publicCommentService`; posting and author mutations use `commentService`.
- API routes derive the acting user from the NextAuth session.
- Author edits set `editedAt`. Deletion marks records as deleted rather than removing them from MongoDB.
- Deleted parents retain visible replies beneath a removal notice and close new replies.
- Threads initially show three replies, with more available on demand.

### Dashboard and profiles

The dashboard paginates the signed-in user's visible comments separately from their owned apps. Profile settings use `accountService`; JWT profile refreshes read the saved user rather than trusting client-supplied session fields.

## Abuse controls and data consistency

### Request validation

Custom API writes accept JSON objects up to **32 KiB** and reject foreign browser origins. Signup accepts only name, email, and password. Passwords are required and limited to bcrypt's **72-byte** input limit.

Configured site origins match protocol, hostname, and port exactly. App codes and page metadata are public, so origin validation does not prove a request came from a human. Guest approval provides an additional publication control.

### Rate limits

Limits use MongoDB-backed fixed windows and apply across application instances.

| Action | Limit per minute |
| --- | --- |
| Comment/reply attempts per client/account | 10 |
| Comment/reply attempts across one app | 60 |
| Signup attempts per client | 5 |
| Credential login attempts per client | 20 |

Exceeded limits return **HTTP 429** with a `Retry-After` header. Bucket identities are HMAC-hashed with `NEXTAUTH_SECRET`, and a TTL index removes expired buckets. Limits fail closed when the database is unavailable.

### Client identification

- **Vercel:** uses `x-vercel-forwarded-for` automatically.
- **Other trusted proxies:** set `RATE_LIMIT_IP_HEADER` only if the proxy overwrites that header and direct access to the app is blocked.
- **No trusted header:** requests share a fallback bucket. Signed-in comment buckets also include the account ID.

Do not trust arbitrary client-supplied forwarded headers.

### External sign-in returns

Only origins in the operator-managed `AUTH_REDIRECT_ORIGINS` allowlist are accepted as external return destinations. Creating a site does not add its origin to that allowlist.

### Transactions and indexes

Comment creation, approval, spam marking, and deletion update counts with atomic increments in the same transaction. This prevents partial writes and lost concurrent updates.

These changes do not repair previously inaccurate counts. Comment list indexes are declared in the schema; ensure your deployment creates them if MongoDB auto-index creation is disabled.

## Production diagnostics

Winston writes JSON logs to stdout through one Console transport. Logs include timestamps, levels, and the service name. `LOG_LEVEL` defaults to `info`.

### What gets logged

| Level | Events |
| --- | --- |
| **Error** | Unexpected API failures, database connection failures, and NextAuth errors. |
| **Warn** | Access denials, rejected credential logins, incorrect-current-password attempts, transaction retries, and successful API requests taking at least five seconds. |
| **Warn, once per bucket/window** | The first request exceeding a rate limit. Further rate-limit rejections remain silent at the API layer. |
| **Info** | Account creation, sign-in/out, profile/password changes, site creation/settings changes, moderation/deletion/spam marking, and new database connections. |
| **Debug** | Validation rejections, comment creation/edits, and database connection starts. |
| **Silent** | Routine successful API requests, including `/api/auth/session` polling, and reused database connections. |

Comment success events appear only after commit. Retries and rollbacks cannot produce false success logs. Transaction retry warnings include the operation, attempt count, and timing. Database timeouts are unchanged.

### Tracing a failure

1. Find the response's **`X-Request-ID`** header.
2. Search server logs for that ID. It accompanies events from the request, including those after awaited database calls.
3. Inspect the event's method, path, status, elapsed time, error type/driver code, and available code locations.

Request IDs are generated by the server. API failures emit one `api.failed` error event; access denials use `api.access_denied`, and slow successes use `api.slow`. NextAuth failures retain their diagnostic code.

Use `LOG_LEVEL=debug` for validation diagnostics and routine write events during an investigation. It does not enable logging every successful HTTP request.

### Data excluded from logs

Request bodies, query strings, cookies, tokens, passwords, emails, account identifiers, comment text, raw error messages, and full stacks are excluded.

Unexpected failures can include up to eight parsed stack file locations. Site/comment resource IDs appear where useful; user names and content do not. Authentication warnings use fixed reason codes, and rate-limit warnings include the scope and limit without the client IP/key.

## Current limitations

- **Guest ownership:** guest comments cannot be claimed after signing in. Sign in before posting to retain author controls.
- **Embedded authentication:** recognition depends on browser cookie/storage policies. Verify Safari with a real cross-site HTTPS embed.
- **Separate sign-in methods:** Google, GitHub, and credentials accounts are not automatically linked by email.
- **Password recovery:** there is no password-reset email flow. Password changes require the current password and do not revoke existing JWT sessions.
- **Usage limits:** each account can create up to 10 apps. Each comment/reply allows up to 5,000 characters and one GIF.
- **Manual verification:** real OAuth redirects, provider network behavior, and Safari permission prompts still need browser checks. Unit tests mock external calls; the optional integration suite covers MongoDB persistence and transactions.
