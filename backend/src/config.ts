// WARNING: "dev_secret" is insecure — set JWT_SECRET env var in production
export let jwt_secret = process.env.JWT_SECRET || "dev_secret"
