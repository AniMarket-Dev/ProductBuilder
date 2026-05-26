import type { CropSettings } from "@/types/constructor";

export function buildTechnicalDescription(params: {
  buildId: string;
  cropSettings: CropSettings;
  originalImageUrl: string;
  previewImageUrl: string;
  storageKey: string;
  templateTitle: string;
}) {
  return [
    `<p>Сгенерированный товар для конструктора "${params.templateTitle}".</p>`,
    "<hr>",
    "<pre>",
    "[constructor_meta]",
    `build_id=${params.buildId}`,
    `original_image_url=${params.originalImageUrl}`,
    `preview_image_url=${params.previewImageUrl}`,
    `storage_key=${params.storageKey}`,
    `crop_settings_json=${JSON.stringify(params.cropSettings)}`,
    "[/constructor_meta]",
    "</pre>",
  ].join("\n");
}
