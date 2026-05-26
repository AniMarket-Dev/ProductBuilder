import { z } from "zod";

import { ACCEPTED_IMAGE_TYPES } from "@/lib/constants";

export const uploadRouteSchema = z.object({
  fileSize: z.number().positive(),
  mimeType: z.enum(ACCEPTED_IMAGE_TYPES),
});

export const buildRouteSchema = z.object({
  cropSettings: z.object({
    backgroundColor: z.string().optional(),
    croppedAreaPixels: z
      .object({
        height: z.number().positive(),
        width: z.number().positive(),
        x: z.number(),
        y: z.number(),
      })
      .optional(),
    imageNaturalHeight: z.number().positive(),
    imageNaturalWidth: z.number().positive(),
    rotation: z.number(),
    scale: z.number().positive(),
    viewportHeight: z.number().positive(),
    viewportWidth: z.number().positive(),
    x: z.number(),
    y: z.number(),
  }),
  quantity: z.number().int().positive().max(999),
  selectedOptions: z.record(z.string(), z.string()),
  templateProductId: z.number().int().positive(),
  uploadId: z.string().min(1),
});
