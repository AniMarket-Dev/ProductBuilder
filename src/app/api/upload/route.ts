import { imageSize } from "image-size";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { constructorUploads } from "@/lib/db/schema";
import { getEnv } from "@/lib/env";
import { HttpError, toHttpError } from "@/lib/http";
import { enforceOrigin, enforceRateLimit } from "@/lib/request";
import { uploadBufferToStorage } from "@/lib/storage/s3";
import { uploadRouteSchema } from "@/lib/validators/upload";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    await enforceOrigin();
    await enforceRateLimit("upload", {
      limit: 20,
      windowMs: 60_000,
    });

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      throw new HttpError(400, "File is required.");
    }

    const maxUploadSizeBytes = getEnv().MAX_UPLOAD_SIZE_MB * 1024 * 1024;

    uploadRouteSchema.parse({
      fileSize: file.size,
      mimeType: file.type,
    });

    if (file.size > maxUploadSizeBytes) {
      throw new HttpError(413, "Uploaded file exceeds the configured size limit.");
    }

    const uploadId = crypto.randomUUID();
    const buffer = Buffer.from(await file.arrayBuffer());
    const dimensions = imageSize(buffer);

    if (!dimensions.width || !dimensions.height) {
      throw new HttpError(400, "Unable to determine image dimensions.");
    }

    const extension = file.type === "image/png"
      ? "png"
      : file.type === "image/webp"
        ? "webp"
        : "jpg";

    const storageUpload = await uploadBufferToStorage({
      body: buffer,
      contentType: file.type,
      key: `originals/${uploadId}.${extension}`,
    });

    await db.insert(constructorUploads).values({
      fileSize: file.size,
      height: dimensions.height,
      id: uploadId,
      mimeType: file.type,
      originalImageUrl: storageUpload.publicUrl,
      storageKey: storageUpload.key,
      width: dimensions.width,
    });

    return NextResponse.json({
      fileSize: file.size,
      height: dimensions.height,
      id: uploadId,
      mimeType: file.type,
      originalImageUrl: storageUpload.publicUrl,
      storageKey: storageUpload.key,
      uploadId,
      width: dimensions.width,
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
