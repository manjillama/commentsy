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

## Tech stacks

- Node.js 18
- Next.js 13
- NextAuth 4
- TailwindCSS
- TypeScript
- MongoDB (Mongoose)

### 1. Clone the repository and install dependencies

```
git clone https://github.com/manjillama/commentsy.git
npm install
```

### 2. Configure your local environment

Copy the .env.local.example file in this directory to .env.local (which will be ignored by Git):

```
cp .env.local.example .env.local
```

Add details for one or more providers (e.g. Google, GitHub, Email, etc).

### 3. First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

### Or run the development server with Docker:

```
docker-compose up
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


### Optional: GIF comments with KLIPY

Create a browser API key at [KLIPY Partner Panel](https://partner.klipy.com) and add it to `.env.local`:

```dotenv
NEXT_PUBLIC_KLIPY_API_KEY=your_browser_api_key
```

Restart the dev server after adding the key; rebuild for production. The GIF button appears in comment and reply forms when the key is configured. Visitors can search, preview, remove, and post one GIF with or without text. Without a key, text comments continue to work and previously saved GIFs remain visible.

This key is intentionally public: KLIPY requires API requests and media loads to originate in the visitor's browser. Media URLs are saved as attachment metadata; GIF files are loaded directly from KLIPY without proxying, optimizing, or storing copies. Search and share reporting use an anonymous per-page identifier, not account details.

Configure content filtering in the KLIPY Partner Panel and leave ads disabled for this GIF-only picker. Testing keys currently allow 100 API requests/hour; request production access before launch. See [KLIPY's integration documentation](https://docs.klipy.com/) for current requirements and limits.

Run GIF validation and integration checks with `node --test tests/gifs.test.cjs`. These use a real Mongoose schema and mocked provider/database calls; no API key or database is needed.
