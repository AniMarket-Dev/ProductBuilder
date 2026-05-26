import { NextResponse } from "next/server";

import { getBuildDetails } from "@/lib/constructor/build-service";
import { toHttpError } from "@/lib/http";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const build = await getBuildDetails(id);

    return NextResponse.json({
      error: build.errorText ?? null,
      generatedProductHandle: build.generatedProductHandle ?? null,
      generatedProductId: build.generatedProductId ?? null,
      generatedVariantId: build.generatedVariantId ?? null,
      originalImageUrl: build.originalImageUrl ?? null,
      previewImageUrl: build.previewImageUrl ?? null,
      status: build.status,
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
