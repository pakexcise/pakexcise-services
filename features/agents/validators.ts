import { z } from "zod";

import { phoneSchema } from "@/lib/validations/common";

export const updateAgentProfileSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: phoneSchema,
});
