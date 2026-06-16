import { z } from "zod";

export const syncServiceAvailabilitySchema = z.object({
  serviceId: z.string().cuid(),
  regionIds: z.array(z.string().cuid()),
});

export const syncBulkServiceAvailabilitySchema = z.object({
  assignments: z.array(
    z.object({
      serviceId: z.string().cuid(),
      regionIds: z.array(z.string().cuid()),
    }),
  ),
});
