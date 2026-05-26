# InSales Constructor Mini App

Production-ready mini app для конструктора товара под InSales на `Next.js + TypeScript + Tailwind + Drizzle + PostgreSQL`.

## Что реализовано

- iframe-friendly frontend-конструктор на `/constructor`
- загрузка пользовательского изображения через `POST /api/upload`
- обязательное сохранение оригинала во внешнее S3-compatible хранилище
- локальный crop/position editor на `react-easy-crop`
- серверная генерация preview через `sharp`
- build-flow через `POST /api/constructor/build`
- создание hidden product в InSales и возврат `variant_id`
- canonical status endpoint `GET /api/constructor/build/:id`
- parent snippet для storefront, который принимает `postMessage` и делает `POST /cart_items`

## Структура проекта

- `src/app` — страницы и API routes Next.js
- `src/components/constructor` — клиентский UI конструктора
- `src/lib/constructor` — build orchestration, маппинг вариантов и техметаданные
- `src/lib/images` — генерация preview
- `src/lib/insales` — HTTP-клиент к InSales Admin API
- `src/lib/storage` — загрузка оригиналов и preview в S3-compatible storage
- `src/lib/db` — Drizzle schema, подключение и миграции
- `public/embed/insales-parent.js` — storefront snippet helper
- `public/assets/references` — локальные reference assets из старого конструктора
- `drizzle` — SQL миграции

## ENV

Скопируйте `.env.example` в `.env.local` и заполните значения:

```bash
APP_URL=
INSALES_SHOP_URL=
INSALES_API_KEY=
INSALES_API_PASSWORD=
DATABASE_URL=
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=
STORAGE_BUCKET=
STORAGE_PUBLIC_URL=
STORAGE_ENDPOINT=
STORAGE_REGION=
ALLOWED_ORIGINS=
MAX_UPLOAD_SIZE_MB=
```

`STORAGE_ENDPOINT` обязателен для R2/MinIO/других S3-compatible провайдеров. Для AWS S3 его можно оставить пустым.

## Локальный запуск

```bash
npm install
npm run db:migrate
npm run dev
```

После запуска:

- основной экран: `http://localhost:3000/constructor?templateProductId=123`
- демо-landing: `http://localhost:3000/`

## Деплой на Vercel

1. Создайте проект в Vercel из этой директории.
2. Добавьте все ENV из `.env.example`.
3. Убедитесь, что у проекта включён Node.js runtime.
4. Подключите PostgreSQL и выполните `npm run db:migrate`.
5. В storefront InSales вставьте iframe на `/constructor?templateProductId=...&shopOrigin=https://ваш-магазин`.

## Embed в storefront InSales

Минимальный parent-side пример:

```html
<div id="constructor-host"></div>
<script src="https://your-vercel-app.vercel.app/embed/insales-parent.js"></script>
<script>
  const iframe = document.createElement("iframe");
  iframe.src =
    "https://your-vercel-app.vercel.app/constructor?templateProductId=123&shopOrigin=" +
    encodeURIComponent(window.location.origin);
  iframe.style.width = "100%";
  iframe.style.border = "0";
  iframe.style.minHeight = "1200px";
  document.getElementById("constructor-host").appendChild(iframe);

  window.InSalesConstructorEmbed.bind({
    iframe,
    allowedOrigin: "https://your-vercel-app.vercel.app",
  });
</script>
```

## API

### `POST /api/upload`

Принимает `multipart/form-data` с полем `file`.

Ответ:

```json
{
  "id": "uuid",
  "uploadId": "uuid",
  "originalImageUrl": "https://cdn.example.com/originals/uuid.jpg",
  "storageKey": "originals/uuid.jpg",
  "width": 1600,
  "height": 2400,
  "mimeType": "image/jpeg",
  "fileSize": 123456
}
```

### `POST /api/constructor/build`

Принимает:

```json
{
  "templateProductId": 123,
  "uploadId": "uuid",
  "cropSettings": {
    "x": 0,
    "y": 0,
    "scale": 1,
    "rotation": 0,
    "viewportWidth": 320,
    "viewportHeight": 720,
    "imageNaturalWidth": 1600,
    "imageNaturalHeight": 2400
  },
  "selectedOptions": {
    "option-1": "30x70"
  },
  "quantity": 1
}
```

Ответ:

```json
{
  "buildId": "uuid",
  "status": "ready"
}
```

### `GET /api/constructor/build/:id`

Возвращает canonical state сборки:

```json
{
  "status": "ready",
  "generatedProductId": 321,
  "generatedVariantId": 654,
  "generatedProductHandle": "podushka-build",
  "originalImageUrl": "https://cdn.example.com/originals/uuid.jpg",
  "previewImageUrl": "https://cdn.example.com/previews/uuid.png",
  "error": null
}
```

## Ограничения текущей v1

- Реализован single-shop сценарий с одним набором `INSALES_*` credentials.
- Оригинал хранится во внешнем storage, в InSales дублируется только preview и техблок в описании.
- Hidden flag и image attach реализованы через текущий Admin API, но эти вызовы нужно проверить на боевом магазине InSales перед релизом.
