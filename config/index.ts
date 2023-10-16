const config = {
  siteUrl: process.env.SITE_URL,
  envs: {
    prod: "production",
    dev: "development",
    stage: "staging",
    test: "test",
  },
  defaultTimeZone: "Asia/Kathmandu",
};

export { config };
export * from "./keys";
