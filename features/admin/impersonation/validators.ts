import { z } from "zod";

export const impersonateUserSchema = z.object({
  userId: z.string().trim().min(1).max(64),
});

export type ImpersonateUserInput = z.infer<typeof impersonateUserSchema>;
