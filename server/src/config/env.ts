export const env = {
  port: parseInt(process.env.PORT || "3000", 10),
  databaseUrl: process.env.DATABASE_URL || "postgresql://postgres:your_password@localhost:5432/adult_toy_store",
  jwtSecret: process.env.JWT_SECRET || "change-me-in-production",
  nodeEnv: process.env.NODE_ENV || "development",
};
