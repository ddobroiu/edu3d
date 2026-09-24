import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";

export const BUCKET = process.env.R2_BUCKET_NAME || "edu3d-assets";

let client: S3Client | null = null;

export function getR2() {
  if (!client) {
    client = new S3Client({
      region: "auto",
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
      },
    });
  }
  return client;
}

export async function uploadToR2(key: string, body: Buffer | Uint8Array, contentType: string) {
  await getR2().send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );
  return publicUrl(key);
}

export async function getFromR2(key: string) {
  return getR2().send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
}

/** Sterge pana la 1000 de obiecte intr-o singura cerere. */
export async function deleteFromR2(keys: string[]) {
  if (keys.length === 0) return;

  for (let index = 0; index < keys.length; index += 1000) {
    await getR2().send(
      new DeleteObjectsCommand({
        Bucket: BUCKET,
        Delete: { Objects: keys.slice(index, index + 1000).map((Key) => ({ Key })) },
      })
    );
  }
}

/** Din URL-ul public inapoi la cheia din bucket. */
export function keyFromUrl(url: string) {
  const marker = "/api/storage/";
  const index = url.indexOf(marker);
  return index === -1 ? null : url.slice(index + marker.length);
}

/**
 * Servim totul prin proxy-ul propriu (/api/storage), ca sa nu depindem de
 * setarile de acces public ale bucket-ului si sa pastram URL-uri pe edu3d.ro.
 */
export function publicUrl(key: string) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "https://edu3d.ro";
  return `${base}/api/storage/${key}`;
}
