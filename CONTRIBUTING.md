# Contributing to Commentsy

Small, focused changes are welcome. Start with the [README](README.md) for installation, environment variables, OAuth callbacks, and embed testing.

## Development workflow

1. Fork/clone the repository and create a branch from the branch you plan to target.
2. Run `npm ci`, copy `.env.local.example` to `.env.local`, and configure a development database and session secret.
3. Run `npm run dev`. Use credentials signup unless you need to test an OAuth provider.
4. Make a focused change, following the existing TypeScript, Tailwind, service, and API route conventions.
5. Run the checks below and verify the affected user flow in a browser.

```bash
npm run lint
npx tsc --noEmit --incremental false
npm test
```

Run one suite with, for example, `node --test tests/comments.test.cjs`. Tests do not need the app server or external services. Node.js 20–22 is tested and supported. With nvm, run `nvm install` and `nvm use` in the project directory.

## Where to make changes

- Put UI in `components/` and pages/HTTP handlers in `app/`.
- Keep data operations and ownership rules in `services/`. Derive account identity from the session, not the request body.
- Update `models/` and `interfaces/` together when adding persisted fields. Consider existing records without those fields and all query projections that need to return them.
- Preserve the default embed appearance when adding customization. Check both light and dark themes and narrow screens.
- Add meaningful regression tests in the relevant `tests/*.test.cjs` suite. Shared fixtures and the TypeScript loader live in `tests/helpers.cjs`.

## Manual checks

Choose the checks relevant to the change:

- Comments: signed-in and guest posting, replies, GIF-only content, edit/cancel/delete, and pagination after deletion.
- Authentication: credentials errors and success, provider login when configured, and return navigation.
- Embeds: host-page metadata, resizing, theme colors, and Safari storage-access approval/denial. Keep local hostnames consistent; use HTTPS for cross-site authentication tests.
- Account/settings: validation, save feedback, session/profile refresh, and provider-specific controls.

Unit suites mock external services and database operations. Supply `MONGODB_URI_TEST` with a replica set URI to enable the optional database integration suite described in README. CI runs both. Real browser checks remain necessary for OAuth and embedded authentication.

## Pull requests

Describe the problem, the resulting behavior, and what you tested. Include screenshots for visible UI changes and note any configuration or schema implications.

Before opening a PR:

- [ ] Keep the change focused and review the full diff.
- [ ] Run lint, TypeScript, and the feature test suites.
- [ ] Verify the relevant browser flow; describe anything you could not verify.
- [ ] Update documentation and `.env.local.example` for configuration changes.
- [ ] Include related service, model, interface, API, and test changes together.
- [ ] Exclude `.env.local`, credentials, personal data, and generated build output.

GitHub Actions runs lint, TypeScript, unit tests, and replica-set integration tests on pushes and pull requests. Run the local checks before opening a PR.
