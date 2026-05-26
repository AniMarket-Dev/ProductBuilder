"use client";

import { useCallback, useEffect, useMemo, useRef, useState, startTransition } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { ArrowRight, LoaderCircle, PackageCheck, ShoppingCart } from "lucide-react";

import { BuildBanner } from "@/components/constructor/build-banner";
import { OptionGroup } from "@/components/constructor/option-group";
import { ProductPreview } from "@/components/constructor/product-preview";
import { UploadDropzone } from "@/components/constructor/upload-dropzone";
import { formatCurrency } from "@/lib/utils";
import type {
  BuildDetailsResponse,
  BuildResponse,
  ConstructorUpload,
  TemplateProductResponse,
} from "@/types/constructor";

type ConstructorAppProps = {
  shopOrigin?: string;
  templateProductId: number | null;
};

const CROP_ASPECT = 820 / 2400;

export function ConstructorApp({
  shopOrigin,
  templateProductId,
}: ConstructorAppProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const fileUrlRef = useRef<string | null>(null);
  const [templateProduct, setTemplateProduct] = useState<TemplateProductResponse | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [uploadResult, setUploadResult] = useState<ConstructorUpload | null>(null);
  const [localImageUrl, setLocalImageUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [statusText, setStatusText] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [isTemplateLoading, setIsTemplateLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildResult, setBuildResult] = useState<BuildDetailsResponse | null>(null);

  const selectedVariant = useMemo(() => {
    if (!templateProduct) {
      return null;
    }

    return (
      templateProduct.variants.find((variant) =>
        Object.entries(selectedOptions).every(([key, value]) => variant.optionValues[key] === value),
      ) ?? null
    );
  }, [selectedOptions, templateProduct]);

  const canBuild = Boolean(
    templateProductId &&
      uploadResult &&
      selectedVariant &&
      selectedVariant.available &&
      !isUploading &&
      !isBuilding,
  );

  const canAddToCart = Boolean(buildResult?.generatedVariantId && !isBuilding);

  const postResize = useCallback(() => {
    if (!rootRef.current || typeof window === "undefined" || window.parent === window) {
      return;
    }

    window.parent.postMessage(
      {
        payload: {
          height: rootRef.current.scrollHeight,
        },
        type: "constructor:resize",
      },
      shopOrigin ?? "*",
    );
  }, [shopOrigin]);

  useEffect(() => {
    postResize();
    const element = rootRef.current;

    if (!element || typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(() => {
      postResize();
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [postResize]);

  useEffect(() => {
    if (!templateProductId) {
      setErrorText("В URL отсутствует templateProductId. Передайте его из storefront InSales.");
      return;
    }

    setIsTemplateLoading(true);
    setErrorText(null);
    startTransition(() => {
      void fetch(`/api/template-product?templateProductId=${templateProductId}`, {
        cache: "no-store",
      })
        .then(async (response) => {
          if (!response.ok) {
            const payload = (await response.json().catch(() => null)) as { error?: string } | null;
            throw new Error(payload?.error ?? "Не удалось загрузить шаблонный товар.");
          }

          return (await response.json()) as TemplateProductResponse;
        })
        .then((payload) => {
          setTemplateProduct(payload);
          setSelectedOptions(
            Object.fromEntries(
              payload.optionGroups.map((group) => [group.id, group.values[0]?.value ?? ""]),
            ),
          );
        })
        .catch((error: unknown) => {
          setErrorText(error instanceof Error ? error.message : "Не удалось загрузить шаблон.");
        })
        .finally(() => {
          setIsTemplateLoading(false);
        });
    });
  }, [templateProductId]);

  useEffect(() => {
    return () => {
      if (fileUrlRef.current) {
        URL.revokeObjectURL(fileUrlRef.current);
      }
    };
  }, []);

  async function handleFileAccepted(file: File) {
    setIsUploading(true);
    setErrorText(null);
    setStatusText("Сохраняем оригинал изображения во внешнее хранилище...");
    setBuildResult(null);

    if (fileUrlRef.current) {
      URL.revokeObjectURL(fileUrlRef.current);
    }

    const objectUrl = URL.createObjectURL(file);
    fileUrlRef.current = objectUrl;
    setLocalImageUrl(objectUrl);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        body: formData,
        method: "POST",
      });

      const payload = (await response.json()) as ConstructorUpload & {
        error?: string;
      };

      if (!response.ok || payload.error) {
        throw new Error(payload.error ?? "Не удалось загрузить файл.");
      }

      setUploadResult(payload);
      setStatusText("Оригинал сохранён. Теперь можно настроить кадрирование и собрать товар.");
    } catch (error) {
      setUploadResult(null);
      setErrorText(error instanceof Error ? error.message : "Не удалось сохранить файл.");
    } finally {
      setIsUploading(false);
    }
  }

  function handleCropComplete(_croppedArea: Area, areaPixels: Area) {
    setCroppedAreaPixels(areaPixels);
  }

  async function handleBuild() {
    if (!canBuild || !templateProductId || !uploadResult) {
      return;
    }

    setIsBuilding(true);
    setErrorText(null);
    setStatusText("Запускаем build-flow и создаём hidden product...");
    setBuildResult(null);

    try {
      const response = await fetch("/api/constructor/build", {
        body: JSON.stringify({
          cropSettings: {
            backgroundColor: "#FBF8F2",
            croppedAreaPixels,
            imageNaturalHeight: uploadResult.height,
            imageNaturalWidth: uploadResult.width,
            rotation,
            scale: zoom,
            viewportHeight: 720,
            viewportWidth: 320,
            x: crop.x,
            y: crop.y,
          },
          quantity,
          selectedOptions,
          templateProductId,
          uploadId: uploadResult.id,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      const payload = (await response.json()) as BuildResponse & {
        error?: string;
      };

      if (!response.ok || payload.error) {
        throw new Error(payload.error ?? "Сборка завершилась с ошибкой.");
      }

      await syncBuild(payload.buildId);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Не удалось собрать товар.");
      setStatusText(null);
    } finally {
      setIsBuilding(false);
    }
  }

  async function syncBuild(buildId: string) {
    let attempts = 0;

    while (attempts < 10) {
      attempts += 1;
      const response = await fetch(`/api/constructor/build/${buildId}`, {
        cache: "no-store",
      });

      const payload = (await response.json()) as BuildDetailsResponse & {
        error?: string;
      };

      if (!response.ok || payload.error) {
        throw new Error(payload.error ?? "Не удалось прочитать состояние сборки.");
      }

      setBuildResult(payload);

      if (payload.status === "ready") {
        setStatusText("Variant готов. Кнопка добавления в корзину активирована.");
        return;
      }

      if (payload.status === "failed") {
        throw new Error(payload.error ?? "Сборка завершилась с ошибкой.");
      }

      setStatusText("Проверяем статус build...");
      await new Promise((resolve) => {
        setTimeout(resolve, 1200);
      });
    }

    throw new Error("Сборка не вернула финальный статус за ожидаемое время.");
  }

  function handleAddToCart() {
    if (!buildResult?.generatedVariantId || typeof window === "undefined") {
      return;
    }

    if (window.parent !== window) {
      window.parent.postMessage(
        {
          payload: {
            quantity,
            variantId: buildResult.generatedVariantId,
          },
          type: "constructor:add-to-cart",
        },
        shopOrigin ?? "*",
      );
      setStatusText("Сообщение на storefront отправлено. Parent script должен добавить variant в корзину.");
      return;
    }

    setStatusText(
      `Variant ${buildResult.generatedVariantId} готов. Откройте storefront или используйте parent snippet для cart POST.`,
    );
  }

  return (
    <main className="mx-auto max-w-[1500px] px-4 py-4 md:px-6 md:py-6" ref={rootRef}>
      <div className="rounded-[36px] border border-white/60 bg-white/70 p-4 shadow-soft backdrop-blur md:p-6">
        <div className="mb-6 flex flex-col gap-3 border-b border-black/6 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <span className="inline-flex rounded-full border border-gold-300/70 bg-gold-300/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-600">
              insales constructor
            </span>
            <h1 className="font-display text-3xl text-ink md:text-5xl">
              Конструктор товара с пользовательской загрузкой
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-black/60 md:text-base">
              Загружайте оригинал, настраивайте кадрирование, собирайте hidden product и возвращайте готовый
              `variant_id` в storefront InSales.
            </p>
          </div>
          <div className="rounded-[24px] border border-black/5 bg-sand px-5 py-4 text-sm text-black/60 shadow-panel">
            <div className="font-semibold text-ink">
              {templateProduct?.title ?? "Шаблонный товар загрузится после чтения templateProductId"}
            </div>
            <div className="mt-1">
              templateProductId: <span className="font-mono">{templateProductId ?? "missing"}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)_360px]">
          <aside className="space-y-5">
            <UploadDropzone
              disabled={!templateProductId}
              fileName={uploadResult ? `upload #${uploadResult.id.slice(0, 8)}` : null}
              isUploading={isUploading}
              onFileAccepted={handleFileAccepted}
            />

            <div className="rounded-[28px] border border-black/5 bg-white p-5 shadow-panel">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-black/35">
                    кадрирование
                  </div>
                  <h2 className="mt-2 text-xl font-semibold text-ink">Print area</h2>
                </div>
                <div className="rounded-full bg-black/5 px-3 py-1 text-xs font-medium text-black/55">
                  aspect {CROP_ASPECT.toFixed(2)}
                </div>
              </div>

              <div className="relative h-[420px] overflow-hidden rounded-[24px] bg-[#F0ECE2]">
                {localImageUrl ? (
                  <Cropper
                    aspect={CROP_ASPECT}
                    crop={crop}
                    image={localImageUrl}
                    objectFit="contain"
                    onCropChange={setCrop}
                    onCropComplete={handleCropComplete}
                    onRotationChange={setRotation}
                    onZoomChange={setZoom}
                    rotation={rotation}
                    showGrid={false}
                    zoom={zoom}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-8 text-center text-sm leading-6 text-black/45">
                    После загрузки файла здесь появится интерактивная область позиционирования.
                  </div>
                )}
              </div>

              <div className="mt-4 grid gap-4">
                <label className="space-y-2 text-sm text-black/60">
                  <span className="font-medium text-ink">Масштаб</span>
                  <input
                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-black/10 accent-[#D8A125]"
                    max={4}
                    min={1}
                    onChange={(event) => setZoom(Number(event.target.value))}
                    step={0.05}
                    type="range"
                    value={zoom}
                  />
                </label>
                <label className="space-y-2 text-sm text-black/60">
                  <span className="font-medium text-ink">Поворот</span>
                  <input
                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-black/10 accent-[#D8A125]"
                    max={180}
                    min={-180}
                    onChange={(event) => setRotation(Number(event.target.value))}
                    step={1}
                    type="range"
                    value={rotation}
                  />
                </label>
              </div>
            </div>
          </aside>

          <section className="space-y-5">
            <ProductPreview
              crop={crop}
              imageUrl={localImageUrl}
              rotation={rotation}
              serverPreviewUrl={buildResult?.previewImageUrl ?? null}
              zoom={zoom}
            />
            <BuildBanner
              error={errorText}
              message={statusText}
              status={isBuilding ? "processing" : buildResult?.status ?? null}
            />
          </section>

          <aside className="space-y-5">
            <div className="rounded-[28px] border border-black/5 bg-white p-5 shadow-panel">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-black/35">
                    конфигурация
                  </div>
                  <h2 className="mt-2 text-xl font-semibold text-ink">Параметры товара</h2>
                </div>
                {selectedVariant ? (
                  <div className="rounded-full bg-gold-300/18 px-3 py-1 text-xs font-semibold text-gold-600">
                    {formatCurrency(selectedVariant.price, templateProduct?.currency)}
                  </div>
                ) : null}
              </div>

              <div className="mt-5 space-y-4">
                {isTemplateLoading ? (
                  <div className="flex items-center gap-3 rounded-[18px] border border-black/5 bg-sand px-4 py-3 text-sm text-black/60">
                    <LoaderCircle className="h-4 w-4 animate-spin text-gold-600" />
                    Загружаем template product из InSales Admin API...
                  </div>
                ) : null}

                {templateProduct?.optionGroups.map((group) => (
                  <OptionGroup
                    group={group}
                    key={group.id}
                    onSelect={(groupId, value) => {
                      setSelectedOptions((current) => ({
                        ...current,
                        [groupId]: value,
                      }));
                      setBuildResult(null);
                    }}
                    selectedValue={selectedOptions[group.id]}
                  />
                ))}

                <section className="rounded-[24px] border border-black/5 bg-white p-5 shadow-panel">
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-black/35">количество</div>
                  <div className="mt-3 flex items-center gap-3">
                    <input
                      className="w-full rounded-2xl border border-black/10 bg-sand px-4 py-3 text-base text-ink outline-none transition focus:border-gold-500"
                      min={1}
                      onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
                      type="number"
                      value={quantity}
                    />
                    <div className="rounded-2xl border border-black/8 bg-sand px-4 py-3 text-sm text-black/55">
                      шт.
                    </div>
                  </div>
                </section>
              </div>
            </div>

            <div className="rounded-[28px] border border-black/5 bg-white p-5 shadow-panel">
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-black/35">действия</div>
                <p className="text-sm leading-6 text-black/60">
                  Сначала создайте hidden product и variant. После успешной сборки активируется кнопка добавления в корзину.
                </p>
              </div>

              <div className="mt-5 grid gap-3">
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gold-500 px-5 py-3 font-semibold text-white transition hover:bg-gold-600 disabled:cursor-not-allowed disabled:bg-gold-500/45"
                  disabled={!canBuild}
                  onClick={handleBuild}
                  type="button"
                >
                  {isBuilding ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <PackageCheck className="h-4 w-4" />}
                  Создать товар
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-sand px-5 py-3 font-semibold text-ink transition hover:border-black/20 hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-45"
                  disabled={!canAddToCart}
                  onClick={handleAddToCart}
                  type="button"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Добавить в корзину
                </button>
              </div>

              <dl className="mt-5 grid gap-3 text-sm">
                <div className="flex items-center justify-between rounded-2xl bg-sand px-4 py-3">
                  <dt className="text-black/50">Статус</dt>
                  <dd className="font-medium text-ink">{buildResult?.status ?? (isBuilding ? "processing" : "draft")}</dd>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-sand px-4 py-3">
                  <dt className="text-black/50">Variant ID</dt>
                  <dd className="font-medium text-ink">{buildResult?.generatedVariantId ?? "—"}</dd>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-sand px-4 py-3">
                  <dt className="text-black/50">Оригинал</dt>
                  <dd className="max-w-[180px] truncate font-medium text-ink">
                    {uploadResult?.originalImageUrl ?? "ещё не загружен"}
                  </dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
