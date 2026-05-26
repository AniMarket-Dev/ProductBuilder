import { NextResponse } from "next/server";

import { getTemplateProduct } from "@/lib/insales/client";
import { toHttpError, HttpError } from "@/lib/http";
import { normalizeTemplateProduct } from "@/lib/constructor/variants";
import { parseInteger } from "@/lib/utils";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const templateProductId = parseInteger(searchParams.get("templateProductId"));

    if (!templateProductId) {
      throw new HttpError(400, "templateProductId is required.");
    }

    const product = await getTemplateProduct(templateProductId);
    return NextResponse.json(
      normalizeTemplateProduct(product, templateProductId),
    );
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
