# InSales Constructor Mini App

Готовое `Next.js`-приложение для конструктора товара под `InSales` с загрузкой пользовательского изображения, генерацией preview, созданием hidden product и возвратом `variant_id` для добавления в корзину.

## Что уже реализовано

- `Next.js + TypeScript + Tailwind + Drizzle + PostgreSQL`
- iframe-friendly конструктор на `/constructor`
- загрузка пользовательского изображения через `POST /api/upload`
- сохранение оригинала и preview во внешнее S3-compatible хранилище
- локальный crop/position editor на `react-easy-crop`
- серверная генерация preview через `sharp`
- build-flow через `POST /api/constructor/build`
- создание hidden product в InSales и возврат `variant_id`
- canonical status endpoint `GET /api/constructor/build/:id`
- storefront helper: [public/embed/insales-parent.js](/C:/Users/Poligraf%201/Downloads/%D0%A1%D0%B2%D0%BE%D0%B9%20%D0%BA%D0%BE%D0%BD%D1%81%D1%82%D1%80%D1%83%D0%BA%D1%82%D0%BE%D1%80/public/embed/insales-parent.js)

## Структура проекта

- `src/app` - страницы и API routes Next.js
- `src/components/constructor` - UI конструктора
- `src/lib/constructor` - build orchestration, mapping вариантов и техметаданные
- `src/lib/images` - генерация preview
- `src/lib/insales` - клиент для InSales Admin API
- `src/lib/storage` - загрузка оригиналов и preview в storage
- `src/lib/db` - Drizzle schema, подключение и миграции
- `public/assets/references` - reference assets из старого конструктора
- `drizzle` - SQL миграции

## ENV

Скопируй `.env.example` в `.env.local` и заполни значения.

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

## Быстрый запуск локально

```bash
npm install
npm run db:migrate
npm run dev
```

После запуска:

- конструктор: `http://localhost:3000/constructor?templateProductId=123`
- демо-страница: `http://localhost:3000/`

## Настройка Supabase Storage

Текущий storage-слой уже совместим с `Supabase Storage`, потому что Supabase поддерживает `S3 protocol compatibility`.

Официальные источники:

- [Supabase pricing](https://supabase.com/pricing)
- [Supabase Storage S3 compatibility](https://supabase.com/docs/guides/storage/s3/compatibility)
- [Supabase Storage access keys](https://supabase.com/docs/guides/storage/s3/authentication)
- [Supabase public buckets](https://supabase.com/docs/guides/storage/buckets/fundamentals)

### 1. Создать проект Supabase

1. Открой [Supabase Dashboard](https://supabase.com/dashboard/projects).
2. Нажми `New project`.
3. Выбери организацию.
4. Введи:
   - `Project name`
   - `Database Password`
   - `Region`
5. Нажми `Create new project`.

Что ты отсюда получаешь:

- `DATABASE_URL` - позже из настроек проекта
- `project ref` - понадобится для storage endpoint и public URL
- `project region` - понадобится для `STORAGE_REGION`

### 2. Создать bucket для оригиналов и preview

1. В левом меню открой `Storage`.
2. Нажми `Create bucket`.
3. В поле `Name` укажи, например, `constructor-assets`.
4. Включи `Public bucket`.
5. Нажми `Create bucket`.

Что поставить в env:

- `STORAGE_BUCKET=constructor-assets`

### 3. Получить S3 credentials для bucket

1. В Supabase открой `Storage`.
2. Открой раздел `S3 Access Keys`.
3. Нажми `Create access key`.
4. Скопируй:
   - `Access key id`
   - `Secret access key`

Что поставить в env:

- `STORAGE_ACCESS_KEY=<Access key id>`
- `STORAGE_SECRET_KEY=<Secret access key>`

### 4. Получить S3 endpoint и region

1. В том же разделе `Storage` открой `S3 Access Keys` или `S3 configuration`.
2. Скопируй `Endpoint`.
3. Скопируй `Region`.

Обычно значения имеют такой вид:

```env
STORAGE_ENDPOINT=https://<project-ref>.storage.supabase.co/storage/v1/s3
STORAGE_REGION=<project-region>
```

### 5. Сформировать public URL

Для публичного bucket базовый URL обычно такой:

```env
STORAGE_PUBLIC_URL=https://<project-ref>.supabase.co/storage/v1/object/public/<bucket-name>
```

Пример:

```env
STORAGE_PUBLIC_URL=https://abcdefgh.supabase.co/storage/v1/object/public/constructor-assets
```

Эта переменная должна указывать именно на публичную базу bucket, без имени файла. Сам код уже сам допишет `/<storage-key>`.

### 6. Получить DATABASE_URL

1. Открой `Project Settings`.
2. Перейди в `Database`.
3. Найди `Connection string`.
4. Скопируй URI для `psql` или `URI`.

Пример:

```env
DATABASE_URL=postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres
```

Если Supabase показывает параметр SSL, используй строку с SSL.

## Что и куда вносить в Vercel

Открой:

`Vercel -> твой проект -> Settings -> Environment Variables`

Добавь по одному все значения из списка ниже.

### Обязательные значения

```env
APP_URL=https://<твой-project>.vercel.app
INSALES_SHOP_URL=https://<твой-магазин>.myinsales.ru
INSALES_API_KEY=<из InSales приложения>
INSALES_API_PASSWORD=<из install flow InSales приложения>
DATABASE_URL=postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres
STORAGE_ACCESS_KEY=<Supabase S3 Access Key ID>
STORAGE_SECRET_KEY=<Supabase S3 Secret Access Key>
STORAGE_BUCKET=constructor-assets
STORAGE_PUBLIC_URL=https://<project-ref>.supabase.co/storage/v1/object/public/constructor-assets
STORAGE_ENDPOINT=https://<project-ref>.storage.supabase.co/storage/v1/s3
STORAGE_REGION=<project-region>
ALLOWED_ORIGINS=https://<твой-магазин>.myinsales.ru,https://<твой-project>.vercel.app,http://localhost:3000
MAX_UPLOAD_SIZE_MB=15
```

### Что именно нажимать в Vercel

Для каждой переменной:

1. Нажми `Add New`.
2. Выбери `Environment Variable`.
3. Вставь имя переменной в поле `Key`.
4. Вставь значение в поле `Value`.
5. Отметь окружения:
   - `Production`
   - `Preview`
   - `Development`
6. Нажми `Save`.

После добавления всех env:

1. Открой вкладку `Deployments`.
2. Нажми `Redeploy` у последнего деплоя или сделай новый deploy из GitHub.

## Локальный `.env.local` для Supabase

Шаблон:

```bash
APP_URL=http://localhost:3000
INSALES_SHOP_URL=https://your-shop.myinsales.ru
INSALES_API_KEY=
INSALES_API_PASSWORD=
DATABASE_URL=postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=
STORAGE_BUCKET=constructor-assets
STORAGE_PUBLIC_URL=https://<project-ref>.supabase.co/storage/v1/object/public/constructor-assets
STORAGE_ENDPOINT=https://<project-ref>.storage.supabase.co/storage/v1/s3
STORAGE_REGION=<project-region>
ALLOWED_ORIGINS=https://your-shop.myinsales.ru,http://localhost:3000
MAX_UPLOAD_SIZE_MB=15
```

## Деплой на Vercel

1. Импортируй GitHub-репозиторий в Vercel.
2. До первого deploy добавь все ENV.
3. Дождись успешного build.
4. После deploy проверь:
   - `/`
   - `/constructor?templateProductId=<реальный-id>`

## Встраивание в storefront InSales

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

## Ограничения v1

- single-shop сценарий с одним набором `INSALES_*`
- оригинал хранится во внешнем storage
- в InSales дублируются preview и техблок в описании
- вызовы hidden/image attach нужно проверить на боевом магазине InSales перед релизом
