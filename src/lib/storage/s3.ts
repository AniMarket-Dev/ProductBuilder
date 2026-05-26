import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import { getEnv } from "@/lib/env";

let cachedClient: S3Client | null = null;

function getClient() {
  if (cachedClient) {
    return cachedClient;
  }

  const env = getEnv();

  cachedClient = new S3Client({
    credentials: {
      accessKeyId: env.STORAGE_ACCESS_KEY,
      secretAccessKey: env.STORAGE_SECRET_KEY,
    },
    endpoint: env.STORAGE_ENDPOINT || undefined,
    forcePathStyle: Boolean(env.STORAGE_ENDPOINT),
    region: env.STORAGE_REGION,
  });

  return cachedClient;
}

export async function uploadBufferToStorage(params: {
  body: Buffer;
  contentType: string;
  key: string;
}) {
  const env = getEnv();
  const client = getClient();

  await client.send(
    new PutObjectCommand({
      Body: params.body,
      Bucket: env.STORAGE_BUCKET,
      ContentType: params.contentType,
      Key: params.key,
    }),
  );

  return {
    key: params.key,
    publicUrl: `${env.STORAGE_PUBLIC_URL.replace(/\/+$/, "")}/${params.key}`,
  };
}
