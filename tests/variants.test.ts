import { describe, expect, it } from "vitest";

import { normalizeTemplateProduct } from "@/lib/constructor/variants";

describe("normalizeTemplateProduct", () => {
  it("builds option groups and variant map", () => {
    const product = normalizeTemplateProduct(
      {
        id: 11,
        title: "Подушка",
        variants: [
          {
            id: 21,
            option_values: [
              {
                option_name: "Размер",
                option_name_id: 1,
                title: "30x70",
              },
              {
                option_name: "Материал",
                option_name_id: 2,
                title: "Атлас",
              },
            ],
            price: 1200,
            quantity: 9,
            title: "Подушка 30x70 Атлас",
          },
        ],
      },
      11,
    );

    expect(product.optionGroups).toHaveLength(2);
    expect(product.variants[0]?.optionValues["option-1"]).toBe("30x70");
    expect(product.variants[0]?.optionValues["option-2"]).toBe("Атлас");
  });
});
