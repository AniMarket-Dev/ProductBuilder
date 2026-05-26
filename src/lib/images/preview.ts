import sharp from "sharp";

import { PREVIEW_CANVAS, PRINT_AREA } from "@/lib/constants";
import type { CropSettings } from "@/types/constructor";

function buildSvgFrame(backgroundColor = "#FBF8F2") {
  return Buffer.from(
    `
      <svg width="${PREVIEW_CANVAS.width}" height="${PREVIEW_CANVAS.height}" viewBox="0 0 ${PREVIEW_CANVAS.width} ${PREVIEW_CANVAS.height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="surface" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#FFFFFF"/>
            <stop offset="100%" stop-color="#F3EEE4"/>
          </linearGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="28" stdDeviation="34" flood-color="#000000" flood-opacity="0.16"/>
          </filter>
        </defs>
        <rect width="${PREVIEW_CANVAS.width}" height="${PREVIEW_CANVAS.height}" rx="110" fill="${backgroundColor}" />
        <g filter="url(#shadow)">
          <rect x="60" y="60" width="${PREVIEW_CANVAS.width - 120}" height="${PREVIEW_CANVAS.height - 120}" rx="130" fill="url(#surface)"/>
          <rect x="90" y="90" width="${PREVIEW_CANVAS.width - 180}" height="${PREVIEW_CANVAS.height - 180}" rx="120" fill="none" stroke="#E9E0D1" stroke-width="8"/>
        </g>
      </svg>
    `,
  );
}

async function extractArtwork(
  inputBuffer: Buffer,
  cropSettings: CropSettings,
) {
  const image = sharp(inputBuffer).rotate(cropSettings.rotation);
  const metadata = await image.metadata();

  const boundedWidth = metadata.width ?? cropSettings.imageNaturalWidth;
  const boundedHeight = metadata.height ?? cropSettings.imageNaturalHeight;
  const croppedArea = cropSettings.croppedAreaPixels ?? {
    height: boundedHeight,
    width: boundedWidth,
    x: 0,
    y: 0,
  };

  const safeCrop = {
    height: Math.min(Math.max(1, Math.round(croppedArea.height)), boundedHeight),
    width: Math.min(Math.max(1, Math.round(croppedArea.width)), boundedWidth),
    x: Math.max(0, Math.round(croppedArea.x)),
    y: Math.max(0, Math.round(croppedArea.y)),
  };

  return image
    .extract({
      height: safeCrop.height,
      left: safeCrop.x,
      top: safeCrop.y,
      width: safeCrop.width,
    })
    .resize({
      fit: "cover",
      height: PRINT_AREA.height,
      width: PRINT_AREA.width,
    })
    .toBuffer();
}

export async function generateProductPreview(params: {
  cropSettings: CropSettings;
  inputBuffer: Buffer;
}) {
  const artwork = await extractArtwork(params.inputBuffer, params.cropSettings);
  const background = buildSvgFrame(params.cropSettings.backgroundColor);

  return sharp(background)
    .composite([
      {
        input: artwork,
        left: PRINT_AREA.x,
        top: PRINT_AREA.y,
      },
    ])
    .png()
    .toBuffer();
}
