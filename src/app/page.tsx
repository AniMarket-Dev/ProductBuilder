import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center gap-10 px-6 py-12">
      <div className="grid gap-8 rounded-[40px] border border-white/70 bg-white/80 p-8 shadow-soft backdrop-blur md:grid-cols-[1.1fr_0.9fr] md:p-12">
        <div className="space-y-6">
          <span className="inline-flex rounded-full border border-gold-300/70 bg-gold-300/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-gold-600">
            Vercel + InSales
          </span>
          <div className="space-y-4">
            <h1 className="max-w-2xl font-display text-4xl leading-none text-ink md:text-6xl">
              Mini app конструктора товара с загрузкой собственного изображения
            </h1>
            <p className="max-w-xl text-base leading-7 text-black/70 md:text-lg">
              Приложение готово для embed-встраивания в storefront InSales через iframe и повторяет build-flow
              с генерацией hidden product, variant и последующим добавлением в корзину.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link
              className="inline-flex items-center justify-center rounded-full bg-gold-500 px-6 py-3 font-semibold text-white transition hover:bg-gold-600"
              href="/constructor?templateProductId=1"
            >
              Открыть конструктор
            </Link>
            <a
              className="inline-flex items-center justify-center rounded-full border border-black/10 px-6 py-3 font-semibold text-ink transition hover:border-black/20 hover:bg-black/5"
              href="/embed/insales-parent.js"
            >
              Посмотреть snippet
            </a>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="overflow-hidden rounded-[30px] border border-black/5 bg-sand p-3 shadow-panel">
            <Image
              alt="Legacy desktop reference"
              className="h-full w-full rounded-[22px] object-cover"
              height={1035}
              src="/assets/references/maket-desktop.png"
              width={1920}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[24px] border border-black/5 bg-white p-4 shadow-panel">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-black/40">storage</div>
              <p className="mt-3 text-sm leading-6 text-black/65">
                Оригинал всегда уходит во внешнее S3-compatible хранилище и не теряется после создания preview.
              </p>
            </div>
            <div className="rounded-[24px] border border-black/5 bg-white p-4 shadow-panel">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-black/40">embed</div>
              <p className="mt-3 text-sm leading-6 text-black/65">
                Child iframe отправляет `variant_id` и `quantity` в parent через `postMessage`.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
