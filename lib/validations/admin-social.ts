import { z } from "zod";

import { SOCIAL_PLATFORMS } from "@/features/social/lib/platforms";

const platformIds = SOCIAL_PLATFORMS.map((item) => item.id) as [
  (typeof SOCIAL_PLATFORMS)[number]["id"],
  ...(typeof SOCIAL_PLATFORMS)[number]["id"][]];

const platformSchema = z.enum(platformIds);

const iconNameSchema = z
  .string()
  .trim()
  .min(1)
  .max(60)
  .regex(/^[A-Z][a-zA-Z0-9]*$/, "Use PascalCase Lucide icon names");

export const socialLinkCoreSchema = z.object({
  platform: platformSchema,
  url: z.string().trim().url("Enter a valid URL"),
  iconName: iconNameSchema,
  labelEn: z.string().trim().min(1).max(80),
  isActive: z.boolean().default(true),
  displayOrder: z.coerce.number().int().min(0).max(9999).default(0)});

export const createSocialLinkSchema = socialLinkCoreSchema;

export const updateSocialLinkSchema = socialLinkCoreSchema.extend({
  id: z.string().cuid()});

export const socialLinkIdSchema = z.object({
  id: z.string().cuid()});

export const toggleSocialLinkSchema = z.object({
  id: z.string().cuid(),
  isActive: z.boolean()});

export const reorderSocialLinksSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().cuid(),
        displayOrder: z.number().int().min(0).max(9999)}),
    )
    .min(1)
    .max(50)});
