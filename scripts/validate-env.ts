import { validateServerEnv } from "@/config/env.schema";

validateServerEnv();

console.log(`Environment validation passed (${process.env.APP_ENV}).`);
