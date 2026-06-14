import { z } from "zod";

export const createAdminStaffSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(128),
  role: z.enum(["ADMIN", "SUPPORT"]).default("ADMIN"),
  permissions: z.array(z.string()).max(20).default([]),
});

export const updateAdminStaffSchema = z.object({
  userId: z.string().trim().min(1),
  name: z.string().trim().min(2).max(120),
  status: z.enum(["ACTIVE", "DISABLED", "SUSPENDED"]),
  permissions: z.array(z.string()).max(20),
});

export const adminStaffIdSchema = z.object({
  userId: z.string().trim().min(1),
});

export const resetAdminStaffPasswordSchema = z.object({
  userId: z.string().trim().min(1),
  password: z.string().min(8).max(128),
});
