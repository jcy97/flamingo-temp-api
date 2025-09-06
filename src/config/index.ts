export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || "development",

  jwt: {
    secret:
      process.env.JWT_SECRET ||
      "your-super-secret-jwt-key-change-this-in-production",
    expiresIn: process.env.JWT_EXPIRE_TIME || "24h",
    refreshSecret:
      process.env.JWT_REFRESH_SECRET ||
      "your-super-secret-refresh-key-change-this-in-production",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRE_TIME || "7d",
  },

  smtp: {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },

  upload: {
    maxFileSize: parseInt(process.env.FILE_UPLOAD_MAX_SIZE || "10485760"),
  },

  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  },
};
