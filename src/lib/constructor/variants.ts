import type {
  TemplateOptionGroup,
  TemplateProductResponse,
  TemplateVariantSummary,
} from "@/types/constructor";
import type {
  InSalesOptionValue,
  InSalesProduct,
  InSalesVariant,
} from "@/lib/insales/types";

import { DEFAULT_TEMPLATE_CURRENCY } from "@/lib/constants";

function buildGroupKey(optionValue: InSalesOptionValue) {
  return optionValue.option_name_id
    ? `option-${optionValue.option_name_id}`
    : `option-${optionValue.option_name ?? "option"}`;
}

export function normalizeTemplateProduct(
  product: InSalesProduct,
  templateProductId: number,
): TemplateProductResponse {
  const optionMap = new Map<string, TemplateOptionGroup>();
  const variants = (product.variants ?? []).map((variant) => {
    const optionValues = Object.fromEntries(
      (variant.option_values ?? []).map((optionValue) => {
        const key = buildGroupKey(optionValue);
        const currentGroup = optionMap.get(key) ?? {
          id: key,
          name: optionValue.option_name ?? key,
          values: [],
        };

        if (!currentGroup.values.some((entry) => entry.value === optionValue.title)) {
          currentGroup.values.push({
            label: optionValue.title,
            value: optionValue.title,
          });
        }

        optionMap.set(key, currentGroup);
        return [key, optionValue.title];
      }),
    );

    return {
      available: variant.available !== false,
      id: variant.id,
      optionValues,
      price: String(variant.price ?? variant.base_price ?? 0),
      quantity: Number(variant.quantity ?? 0),
      sku: variant.sku ?? null,
      title: variant.title,
    } satisfies TemplateVariantSummary;
  });

  return {
    currency: DEFAULT_TEMPLATE_CURRENCY,
    description: product.description ?? null,
    optionGroups: [...optionMap.values()],
    templateProductId,
    title: product.title,
    variants,
  };
}

export function matchVariantBySelection(
  product: InSalesProduct,
  selectedOptions: Record<string, string>,
) {
  return (product.variants ?? []).find((variant) =>
    (variant.option_values ?? []).every((optionValue) => {
      return selectedOptions[buildGroupKey(optionValue)] === optionValue.title;
    }),
  );
}
