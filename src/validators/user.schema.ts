import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(1, "name is required").max(120),
  zipCode: z.string().min(1, "zipCode is required").max(20),
  country: z.string().optional().default("US"),
  // computed server-side but typed here to align payloads
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  timezone: z.string().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  zipCode: z.string().min(1).max(20).optional(),
  country: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  timezone: z.string().optional(),
});

export const listUsersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});
