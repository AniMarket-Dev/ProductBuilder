"use client";

import { AlertTriangle, CheckCircle2, LoaderCircle } from "lucide-react";

type BuildBannerProps = {
  error?: string | null;
  message?: string | null;
  status?: string | null;
};

export function BuildBanner({ error, message, status }: BuildBannerProps) {
  if (!status && !error && !message) {
    return null;
  }

  const tone = error
    ? {
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
        title: "Ошибка сборки",
        text: error,
      }
    : status === "ready"
      ? {
          icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
          title: "Сборка завершена",
          text: "Variant создан. Теперь можно добавить его в корзину storefront.",
        }
      : {
          icon: <LoaderCircle className="h-5 w-5 animate-spin text-gold-600" />,
          title: "Идёт сборка",
          text: message ?? "Создаём hidden product, генерируем preview и сохраняем метаданные.",
        };

  if (!error && !status && message) {
    return (
      <div className="flex items-start gap-3 rounded-[22px] border border-black/5 bg-white p-4 shadow-panel">
        <div className="mt-0.5">
          <CheckCircle2 className="h-5 w-5 text-gold-600" />
        </div>
        <div>
          <div className="font-semibold text-ink">Статус</div>
          <p className="mt-1 text-sm leading-6 text-black/60">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 rounded-[22px] border border-black/5 bg-white p-4 shadow-panel">
      <div className="mt-0.5">{tone.icon}</div>
      <div>
        <div className="font-semibold text-ink">{tone.title}</div>
        <p className="mt-1 text-sm leading-6 text-black/60">{tone.text}</p>
      </div>
    </div>
  );
}
