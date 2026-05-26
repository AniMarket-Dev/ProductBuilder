import { describe, expect, it } from "vitest";

import { buildTechnicalDescription } from "@/lib/constructor/metadata";

describe("buildTechnicalDescription", () => {
  it("includes original and preview links", () => {
    const output = buildTechnicalDescription({
      buildId: "build-123",
      cropSettings: {
        imageNaturalHeight: 1000,
        imageNaturalWidth: 1000,
        rotation: 0,
        scale: 1,
        viewportHeight: 500,
        viewportWidth: 500,
        x: 0,
        y: 0,
      },
      originalImageUrl: "https://cdn.example.com/original.jpg",
      previewImageUrl: "https://cdn.example.com/preview.png",
      storageKey: "originals/build-123.jpg",
      templateTitle: "Подушка",
    });

    expect(output).toContain("original_image_url=https://cdn.example.com/original.jpg");
    expect(output).toContain("preview_image_url=https://cdn.example.com/preview.png");
  });
});
