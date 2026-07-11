/**
 * PM2 ecosystem for PakExcise live + staging on one VPS.
 *
 * Live  -> PORT 3000
 * Staging -> PORT 3001
 *
 * Usage:
 *   pm2 start ecosystem.config.cjs --only pakexcise-live
 *   pm2 start ecosystem.config.cjs --only pakexcise-staging
 *   pm2 save
 */
module.exports = {
  apps: [
    {
      name: "pakexcise-live",
      cwd: "/var/www/pakexcise-live",
      script: "./node_modules/next/dist/bin/next",
      args: "start -p 3000",
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "900M",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
      },
    },
    {
      name: "pakexcise-staging",
      cwd: "/var/www/pakexcise-staging",
      script: "./node_modules/next/dist/bin/next",
      args: "start -p 3001",
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "900M",
      env: {
        NODE_ENV: "production",
        PORT: "3001",
      },
    },
  ],
};
