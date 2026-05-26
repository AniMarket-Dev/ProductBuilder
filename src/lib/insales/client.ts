import { getEnv } from "@/lib/env";
import { HttpError } from "@/lib/http";
import type { InSalesProduct, InSalesVariant } from "@/lib/insales/types";

type InSalesRequestOptions = {
  method?: "GET" | "POST" | "PUT";
  body?: unknown;
};

async function insalesRequest<T>(
  path: string,
  options: InSalesRequestOptions = {},
) {
  const env = getEnv();
  const url = new URL(path, `${env.INSALES_SHOP_URL.replace(/\/+$/, "")}/`);

  const auth = Buffer.from(
    `${env.INSALES_API_KEY}:${env.INSALES_API_PASSWORD}`,
  ).toString("base64");

  const response = await fetch(url, {
    body: options.body ? JSON.stringify(options.body) : undefined,
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    method: options.method ?? "GET",
    next: {
      revalidate: 0,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new HttpError(
      response.status,
      `InSales API error (${response.status}): ${text}`,
    );
  }

  return (await response.json()) as T;
}

export async function getTemplateProduct(templateProductId: number) {
  return insalesRequest<InSalesProduct>(
    `/admin/products/${templateProductId}.json`,
  );
}

export async function createHiddenProduct(params: {
  categoryId?: number | null;
  description: string;
  imageUrl?: string;
  shortDescription?: string | null;
  templateTitle: string;
  variant: InSalesVariant;
}) {
  const optionValues = (params.variant.option_values ?? []).map((optionValue, index) => ({
    position: optionValue.position ?? index + 1,
    title: optionValue.title,
  }));

  const payload = {
    product: {
      category_id: params.categoryId ?? undefined,
      description: params.description,
      is_hidden: true,
      option_names: (params.variant.option_values ?? []).map(
        (optionValue) => optionValue.option_name ?? `Опция ${optionValue.position ?? 1}`,
      ),
      short_description: params.shortDescription ?? undefined,
      title: `${params.templateTitle} • сборка`,
      variants_attributes: [
        {
          available: true,
          option_values_attributes: optionValues.length ? optionValues : undefined,
          price: params.variant.price ?? params.variant.base_price ?? 0,
          sku: params.variant.sku ?? undefined,
        },
      ],
    },
  };

  const product = await insalesRequest<InSalesProduct>("/admin/products.json", {
    body: payload,
    method: "POST",
  });

  if (params.imageUrl) {
    await attachProductImage(product.id, params.imageUrl);
  }

  // Defensive pass because hidden flag support is not consistently documented.
  await updateProduct(product.id, {
    product: {
      description: params.description,
      is_hidden: true,
    },
  });

  return product;
}

export async function attachProductImage(productId: number, imageUrl: string) {
  return insalesRequest(
    `/admin/products/${productId}/images.json`,
    {
      body: {
        image: {
          src: imageUrl,
        },
      },
      method: "POST",
    },
  );
}

export async function updateProduct(productId: number, payload: unknown) {
  return insalesRequest<InSalesProduct>(
    `/admin/products/${productId}.json`,
    {
      body: payload,
      method: "PUT",
    },
  );
}
