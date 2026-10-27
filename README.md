<p align="center">
   <br/>
   <a href="https://authjs.dev" target="_blank">
   <img height="64" src="https://raw.githubusercontent.com/manjillama/commentsy/dev/public/commentsy.svg" />
   </a>
   <a href="https://nextjs.org" target="_blank">
   <img height="64" src="https://raw.githubusercontent.com/manjillama/commentsy/dev/public/commentsy-text.svg" />
   </a>
   <p align="center">Add comments to your website in just a few minutes.
</p>

<hr/>

## What you can do

Commentsy adds an embeddable comment widget to websites. Readers can post text or GIFs and manage their signed-in comments from the dashboard. Site owners can create apps, moderate conversations, and customize light and dark colors.

Commentsy is a pilot project. For your own deployment, fork and self-host it.

## Local setup

The project uses Next.js 13, NextAuth 4, React, TypeScript, Tailwind CSS, and MongoDB through Mongoose. The Dockerfile and CI workflow currently target Node.js 18. You need npm and a reachable MongoDB database to run the app; automated tests do not need a database.

```bash
git clone https://github.com/manjillama/commentsy.git
cd commentsy
npm ci
cp .env.local.example .env.local
```

Fill in the required values described below. Generate a session secret with `openssl rand -base64 32` and put the result in `NEXTAUTH_SECRET`. Use a development database in `MONGODB_URI`.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Create an email/password account through `/signup`, or configure an OAuth provider before using its sign-in button. The auth configuration registers both Google and GitHub; only configured providers will work.

To run using the existing development Docker setup instead:

```bash
docker compose up --build
```

The Compose file loads `.env.local`, mounts the source, and exposes port 3000. It does not start MongoDB; use a database reachable from the container. `localhost` inside the container is not your host machine.

## Environment variables

Keep `.env.local` private. Values prefixed with `NEXT_PUBLIC_` are included in the browser bundle and must not contain server secrets.

| Variable | Needed for | Purpose |
| --- | --- | --- |
| `MONGODB_URI` | Running the app | MongoDB connection string. |
| `NEXTAUTH_SECRET` | Authentication | Private secret used for sessions. Keep it stable between deployments. |
| `NEXTAUTH_URL` | Authentication | Canonical Commentsy origin, such as `http://localhost:3000`. Also controls the custom session cookie settings. |
| `SITE_URL` | Running the app | Server-side Commentsy origin; used as the embed referrer fallback in development. |
| `NEXT_PUBLIC_SITE_URL` | Running/building the app; public | Browser-facing Commentsy origin for links, metadata, and generated embed snippets. |
| `GITHUB_ID` | GitHub login | OAuth client ID. |
| `GITHUB_SECRET` | GitHub login | Private OAuth client secret. |
| `GOOGLE_CLIENT_ID` | Google login | OAuth client ID. |
| `GOOGLE_CLIENT_SECRET` | Google login | Private OAuth client secret. |
| `NEXT_PUBLIC_KLIPY_API_KEY` | Optional GIF picker; public | KLIPY browser API key. Without it, text posting works and saved GIFs remain visible. |
| `MONGODB_URI_TEST` | Optional database-backed work | Used by the DB configuration when `NODE_ENV=test`. Current automated tests mock database calls and do not need this. |

Set the three site URL variables to the same Commentsy origin, without a trailing slash. Restart the dev server after environment changes. Rebuild deployments after changing public variables. `NODE_ENV` is managed by Next.js commands; do not force it to `test` when running the app normally.

`config/keys.ts` also exposes legacy `CORS_WHITELISTS`, `CRYPTO_SECRET`, and `CRYPTO_IV` entries. No current feature consumes them, so they are not required for setup.

### OAuth setup

Create a GitHub OAuth App and/or a Google OAuth **Web application** client with the callback URL for that provider:

| Provider | Local callback URL |
| --- | --- |
| GitHub | `http://localhost:3000/api/auth/callback/github` |
| Google | `http://localhost:3000/api/auth/callback/google` |

Use `http://localhost:3000` as the local application/homepage URL where requested. For a deployed instance, configure the equivalent callback URLs using its HTTPS origin and update the environment variables. An account must sign in using the provider it was created with; accounts are not automatically linked by email.

### Optional GIF picker

Create a browser API key in the [KLIPY Partner Panel](https://partner.klipy.com) and set `NEXT_PUBLIC_KLIPY_API_KEY`. Configure content filtering there and leave ads disabled for the GIF-only picker. Check [KLIPY's documentation](https://docs.klipy.com/) for current testing limits and production approval requirements.

Search and media requests go directly from the browser to KLIPY. The app saves attachment metadata and the original media URL, rather than GIF files. An anonymous per-page identifier is used for search and share reporting; account details are not sent by this integration.

## Integrating a site

1. Open `/dashboard` and create an app in **Your sites**.
2. Add the host site's origin to the app's authorized domains, including the port locally. Use an origin such as `http://localhost:5500`, without a path or trailing slash.
3. Open the app's integration page and copy **both** its iframe and JavaScript snippets to the host page. The script supplies page metadata and resizes the widget.
4. Replace `{{IDENTIFIER}}` with a stable identifier for that page, such as a post slug. Different pages should have different identifiers.
5. Choose `theme=light` or `theme=dark`, or omit it to use the visitor's device preference.

Use **Appearance** to customize each theme and **Comments** to moderate the app's conversations. The `/docs` page includes a user guide for integration, page identifiers, themes, moderation, and troubleshooting. Use the app's integration page for your generated embed snippets.

### Embedded sign-in and Safari

Sign in to Commentsy in a separate tab. Back in the widget, use **Already signed in? Connect** and allow browser storage access if prompted. The widget checks the session without clearing the comment draft. If access is denied, guest posting remains available.

For local HTTP testing, use the same hostname for the host page and Commentsy, for example `http://localhost:5500` and `http://localhost:3000`. Do not mix `localhost`, `127.0.0.1`, and LAN IPs. Sign in using the widget's Commentsy hostname too.

Local HTTP uses `SameSite=Lax` session cookies. Cross-site embedded sign-in should be tested with HTTPS on both sites; storage-access approval alone does not override SameSite restrictions. Production HTTPS uses `SameSite=None; Secure` cookies.

If you sandbox the iframe, include `allow-scripts`, `allow-same-origin`, `allow-popups`, `allow-popups-to-escape-sandbox`, and `allow-storage-access-by-user-activation`. The host's Permissions Policy must also permit storage access. See the [Storage Access API guide](https://developer.mozilla.org/en-US/docs/Web/API/Storage_Access_API/Using).

## Project structure

| Path | Responsibility |
| --- | --- |
| `app/` | App Router pages and layouts; `/dashboard`, `/account`, `/apps/[id]`, and `/embed/[appcode]`. |
| `app/api/` | HTTP handlers for authentication, apps, comments, moderation, and account settings. |
| `components/embed-comments/` | Embedded comment forms, GIF picker, author controls, and browser session access. |
| `components/account/`, `components/appearance/` | Account and theme editors. |
| `services/` | Database operations and business rules, including ownership checks. |
| `models/`, `interfaces/` | Mongoose schemas and TypeScript data contracts. |
| `lib/` | Database/model helpers and KLIPY browser client. |
| `utils/` | API wrapper, validation, cookies, sessions, and error handling. |
| `context/`, `store/`, `slices/` | Session providers and Redux state for the app list. |
| `tests/` | Feature suites and shared TS-loading/mocking helpers. |

## How the data fits together

- **User:** owns apps and signed-in comments. Guest details are stored on individual comments instead.
- **App:** a website integration owned by a user, with a public embed code, authorized origins, and serialized theme colors.
- **Group:** a conversation associated with one app and a page identifier. The embed creates a group when needed.
- **Comment:** belongs to an app and group. A `parent` reference makes it a reply. It can contain text, one GIF attachment, or both.

The embed loads comments through `publicCommentService`; posting and author mutations go through `commentService`. API routes derive the acting user from the NextAuth session. Author edits set `editedAt`; deletion marks comments as deleted rather than removing database records. Deleting a parent preserves its visible replies beneath a removal notice and closes new replies. Threads initially show three replies, with more available on demand.

The dashboard shows the signed-in user's visible comments with pagination, separately from their owned apps. Profile settings are saved through `accountService`; JWT profile refreshes read the saved user rather than trusting client-supplied session fields.

## Development checks

```bash
npm run lint
npx tsc --noEmit --incremental false
npm test
```

Tests are grouped by GIFs, comments, authentication, embed sessions, dashboard, and account settings. They exercise actual services and a Mongoose schema with mocked database/provider calls; no `.env.local`, database, OAuth credentials, or GIF API key is needed.

GitHub Actions runs `npm ci` and `npm test` on pushes and pull requests. The **Tests** workflow can also be started manually. Lint and type checks are currently local checks, not steps in that workflow.

For a production build with the required environment configured:

```bash
npm run build
npm start
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the development workflow and review checklist.

## Current limitations

- Guest comments cannot be claimed by signing in later. Post while signed in to retain author controls.
- Embedded authentication depends on browser cookie/storage policies. Keep guest posting available and verify Safari with a real cross-site HTTPS embed.
- Google, GitHub, and credentials accounts remain separate sign-in methods; there is no automatic email-based account linking.
- Password changes require the current password. There is no password-reset email flow, and changing a password does not revoke existing JWT sessions.
- Each account can create up to 10 apps. Comment text is limited to 5,000 characters and one GIF attachment per comment or reply.
- Automated tests do not cover real OAuth redirects, database persistence, provider network behavior, or Safari permission prompts. Those need manual verification.
