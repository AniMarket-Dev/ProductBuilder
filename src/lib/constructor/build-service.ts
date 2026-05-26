import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { constructorBuilds, constructorUploads } from "@/lib/db/schema";
import { buildTechnicalDescription } from "@/lib/constructor/metadata";
import { matchVariantBySelection } from "@/lib/constructor/variants";
import { generateProductPreview } from "@/lib/images/preview";
import {
  createHiddenProduct,
  getTemplateProduct,
  updateProduct,
} from "@/lib/insales/client";
import { HttpError } from "@/lib/http";
import { uploadBufferToStorage } from "@/lib/storage/s3";
import type { CropSettings } from "@/types/constructor";
import { toSlug } from "@/lib/utils";

export async function createBuildRecord(params: {
  cropSettings: CropSettings;
  originalImageUrl: string;
  originalStorageKey: string;
  quantity: number;
  selectionJson: Record<string, string>;
  templateProductId: number;
  uploadId: string;
}) {
  const buildId = crypto.randomUUID();

  await db.insert(constructorBuilds).values({
    cropSettingsJson: params.cropSettings,
    id: buildId,
    originalImageUrl: params.originalImageUrl,
    originalStorageKey: params.originalStorageKey,
    quantity: params.quantity,
    selectionJson: params.selectionJson,
    status: "processing",
    templateProductId: params.templateProductId,
    uploadId: params.uploadId,
  });

  return buildId;
}

export async function getUploadById(uploadId: string) {
  const [upload] = await db
    .select()
    .from(constructorUploads)
    .where(eq(constructorUploads.id, uploadId))
    .limit(1);

  if (!upload) {
    throw new HttpError(404, "Upload not found.");
  }

  return upload;
}

async function downloadOriginalImage(url: string) {
  const response = await fetch(url, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new HttpError(
      502,
      `Unable to download original image: ${response.status}`,
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function processBuild(params: {
  buildId: string;
  cropSettings: CropSettings;
  originalImageUrl: string;
  originalStorageKey: string;
  quantity: number;
  selectedOptions: Record<string, string>;
  templateProductId: number;
}) {
  try {
    const templateProduct = await getTemplateProduct(params.templateProductId);
    const templateVariant = matchVariantBySelection(
      templateProduct,
      params.selectedOptions,
    );

    if (!templateVariant) {
      throw new HttpError(422, "Не удалось сопоставить выбранные параметры с вариантом шаблона.");
    }

    const originalImageBuffer = await downloadOriginalImage(params.originalImageUrl);
    const previewBuffer = await generateProductPreview({
      cropSettings: params.cropSettings,
      inputBuffer: originalImageBuffer,
    });

    const previewUpload = await uploadBufferToStorage({
      body: previewBuffer,
      contentType: "image/png",
      key: `previews/${toSlug(String(templateProduct.id))}/${params.buildId}.png`,
    });

    const description = buildTechnicalDescription({
      buildId: params.buildId,
      cropSettings: params.cropSettings,
      originalImageUrl: params.originalImageUrl,
      previewImageUrl: previewUpload.publicUrl,
      storageKey: params.originalStorageKey,
      templateTitle: templateProduct.title,
    });

    const generatedProduct = await createHiddenProduct({
      categoryId: templateProduct.category_id,
      description,
      imageUrl: previewUpload.publicUrl,
      shortDescription: templateProduct.short_description ?? null,
      templateTitle: templateProduct.title,
      variant: templateVariant,
    });

    await updateProduct(generatedProduct.id, {
      product: {
        description,
        is_hidden: true,
        title: `${templateProduct.title} • ${params.buildId.slice(0, 8)}`,
      },
    });

    const generatedVariantId = generatedProduct.variants?.[0]?.id ?? null;

    await db
      .update(constructorBuilds)
      .set({
        completedAt: new Date(),
        generatedProductHandle: generatedProduct.handle ?? null,
        generatedProductId: generatedProduct.id,
        generatedVariantId,
        previewImageUrl: previewUpload.publicUrl,
        previewStorageKey: previewUpload.key,
        selectedVariantSnapshotJson: templateVariant,
        status: "ready",
        updatedAt: new Date(),
      })
      .where(eq(constructorBuilds.id, params.buildId));

    return {
      buildId: params.buildId,
      generatedVariantId,
      status: "ready" as const,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Не удалось создать товар на стороне сервера.";

    await db
      .update(constructorBuilds)
      .set({
        completedAt: new Date(),
        errorText: message,
        status: "failed",
        updatedAt: new Date(),
      })
      .where(eq(constructorBuilds.id, params.buildId));

    return {
      buildId: params.buildId,
      error: message,
      status: "failed" as const,
    };
  }
}

export async function getBuildDetails(buildId: string) {
  const [build] = await db
    .select()
    .from(constructorBuilds)
    .where(eq(constructorBuilds.id, buildId))
    .limit(1);

  if (!build) {
    throw new HttpError(404, "Build not found.");
  }

  return build;
}

export async function getBuildForUpload(buildId: string, uploadId: string) {
  const [build] = await db
    .select()
    .from(constructorBuilds)
    .where(
      and(
        eq(constructorBuilds.id, buildId),
        eq(constructorBuilds.uploadId, uploadId),
      ),
    )
    .limit(1);

  return build ?? null;
}
