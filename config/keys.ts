export const keys = {
  CORS_WHITELISTS: new RegExp(process.env.CORS_WHITELISTS ?? ""),
  LOGS: process.env.NODE_ENV === "production" ? "combined" : "dev",
  MONGODB_URI:
    process.env.NODE_ENV === "test"
      ? process.env.MONGODB_URI_TEST
      : process.env.MONGODB_URI,
  CRYPTO_SECRET: process.env.CRYPTO_SECRET,
  CRYPTO_IV: process.env.CRYPTO_IV,
  GITHUB_ID: process.env.GITHUB_ID,
  GITHUB_SECRET: process.env.GITHUB_SECRET,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
};
