import { NextResponse } from "next/server";

import {
  createBuildRecord,
  getUploadById,
  processBuild,
} from "@/lib/constructor/build-service";
import { HttpError, toHttpError } from "@/lib/http";
import { enforceOrigin, enforceRateLimit } from "@/lib/request";
import { buildRouteSchema } from "@/lib/validators/upload";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    await enforceOrigin();
    await enforceRateLimit("build", {
      limit: 10,
      windowMs: 60_000,
    });

    const payload = buildRouteSchema.parse(await request.json());
    const upload = await getUploadById(payload.uploadId);

    const buildId = await createBuildRecord({
      cropSettings: payload.cropSettings,
      originalImageUrl: upload.originalImageUrl,
      originalStorageKey: upload.storageKey,
      quantity: payload.quantity,
      selectionJson: payload.selectedOptions,
      templateProductId: payload.templateProductId,
      uploadId: payload.uploadId,
    });

    const result = await processBuild({
      buildId,
      cropSettings: payload.cropSettings,
      originalImageUrl: upload.originalImageUrl,
      originalStorageKey: upload.storageKey,
      quantity: payload.quantity,
      selectedOptions: payload.selectedOptions,
      templateProductId: payload.templateProductId,
    });

    return NextResponse.json({
      buildId,
      status: result.status,
    });
  } catch (error) {
    const httpError = toHttpError(error);
    return NextResponse.json(
      {
        error: httpError.message,
      },
      {
        status: httpError.status,
      },
    );
  }
}
