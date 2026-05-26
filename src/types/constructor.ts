export type BuildStatus = "pending" | "processing" | "ready" | "failed";

export type CropAreaPixels = {
  height: number;
  width: number;
  x: number;
  y: number;
};

export type CropSettings = {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  viewportWidth: number;
  viewportHeight: number;
  imageNaturalWidth: number;
  imageNaturalHeight: number;
  backgroundColor?: string;
  croppedAreaPixels?: CropAreaPixels;
};

export type ConstructorUpload = {
  fileSize: number;
  height: number;
  id: string;
  mimeType: string;
  originalImageUrl: string;
  storageKey: string;
  width: number;
};

export type TemplateOptionValue = {
  label: string;
  value: string;
};

export type TemplateOptionGroup = {
  id: string;
  name: string;
  values: TemplateOptionValue[];
};

export type TemplateVariantSummary = {
  available: boolean;
  id: number;
  optionValues: Record<string, string>;
  price: string;
  quantity: number;
  sku: string | null;
  title: string;
};

export type TemplateProductResponse = {
  currency: string;
  description: string | null;
  optionGroups: TemplateOptionGroup[];
  templateProductId: number;
  title: string;
  variants: TemplateVariantSummary[];
};

export type BuildResponse = {
  buildId: string;
  status: BuildStatus;
};

export type BuildDetailsResponse = {
  error: string | null;
  generatedProductHandle: string | null;
  generatedProductId: number | null;
  generatedVariantId: number | null;
  originalImageUrl: string | null;
  previewImageUrl: string | null;
  status: BuildStatus;
};
