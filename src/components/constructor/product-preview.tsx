"use client";

import type { CSSProperties } from "react";
import Image from "next/image";

import { PREVIEW_CANVAS } from "@/lib/constants";

type ProductPreviewProps = {
  crop: { x: number; y: number };
  imageUrl?: string | null;
  rotation: number;
  serverPreviewUrl?: string | null;
  zoom: number;
};

export function ProductPreview({
  crop,
  imageUrl,
  rotation,
  serverPreviewUrl,
  zoom,
}: ProductPreviewProps) {
  const previewStyle = {
    aspectRatio: `${PREVIEW_CANVAS.width}/${PREVIEW_CANVAS.height}`,
  } satisfies CSSProperties;

  const artworkStyle = {
    transform: `translate(${crop.x}px, ${crop.y}px) scale(${zoom}) rotate(${rotation}deg)`,
  } satisfies CSSProperties;

  return (
    <div className="relative overflow-hidden rounded-[40px] border border-white/70 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),rgba(244,237,225,0.98))] p-4 shadow-soft">
      <div className="absolute inset-0 bg-grid-fade opacity-80" />
      <div className="relative grid gap-4 lg:grid-cols-[120px_minmax(0,1fr)]">
        <div className="hidden gap-4 lg:grid">
          <div className="overflow-hidden rounded-[24px] border border-white/70 bg-white/70 p-2 shadow-panel">
            <Image
              alt="Legacy composition reference"
              className="h-full w-full rounded-[18px] object-cover"
              height={1035}
              src="/assets/references/maket-desktop.png"
              width={1920}
            />
          </div>
          <div className="overflow-hidden rounded-[24px] border border-white/70 bg-white/70 p-2 shadow-panel">
            <Image
              alt="Legacy mobile reference"
              className="h-full w-full rounded-[18px] object-cover"
              height={1835}
              src="/assets/references/maket-mobile.png"
              width={320}
            />
          </div>
        </div>

        <div className="relative mx-auto flex w-full max-w-[500px] items-center justify-center">
          <div className="relative w-full max-w-[360px]" style={previewStyle}>
            <div className="absolute inset-[3%] rounded-[110px] bg-white shadow-pillow" />
            <div className="absolute inset-x-[16%] inset-y-[8%] overflow-hidden rounded-[88px] border border-[#E7DED0] bg-[#FBF8F2]">
              {imageUrl ? (
                <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt="Artwork preview"
                    className="max-w-none object-cover"
                    src={imageUrl}
                    style={artworkStyle}
                  />
                </div>
              ) : (
                <div className="flex h-full items-center justify-center px-8 text-center text-sm leading-6 text-black/45">
                  После загрузки здесь появится локальный preview печатной зоны.
                </div>
              )}
            </div>
            <div className="absolute inset-x-[12%] bottom-[4%] top-auto h-12 rounded-full bg-black/5 blur-xl" />
          </div>
        </div>
      </div>

      {serverPreviewUrl ? (
        <div className="relative mt-6 overflow-hidden rounded-[28px] border border-black/5 bg-white p-3 shadow-panel">
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-black/35">
            server preview
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Server generated preview"
            className="h-auto w-full rounded-[18px] object-cover"
            src={serverPreviewUrl}
          />
        </div>
      ) : null}
    </div>
  );
}
