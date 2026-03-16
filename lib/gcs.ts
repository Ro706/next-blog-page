import { Storage } from '@google-cloud/storage';

let storage: Storage | null = null;

function getStorage() {
  if (!storage) {
    let privateKey = process.env.GCS_PRIVATE_KEY || '';
    
    // Robustly extract and reconstruct the PEM format to prevent OpenSSL DECODER errors
    // caused by mangled environment variables (quotes, escaped newlines, extra spaces).
    const match = privateKey.match(/-----BEGIN PRIVATE KEY-----([\s\S]+?)-----END PRIVATE KEY-----/);
    if (match) {
      // Remove all spaces, newlines, and literal '\n' from the base64 payload
      const base64Data = match[1].replace(/\\n/g, '').replace(/\s+/g, '');
      // Chunk the base64 data into exactly 64-character lines as required by PEM
      const chunks = base64Data.match(/.{1,64}/g) || [];
      privateKey = `-----BEGIN PRIVATE KEY-----\n${chunks.join('\n')}\n-----END PRIVATE KEY-----\n`;
    } else {
      // Fallback in case it doesn't match the regex for some reason
      privateKey = privateKey.replace(/^"|"$|^'|'$/g, '').replace(/\\n/g, '\n');
    }

    storage = new Storage({
      projectId: process.env.GCS_PROJECT_ID,
      credentials: {
        client_email: process.env.GCS_CLIENT_EMAIL,
        private_key: privateKey,
      },
    });
  }
  return storage;
}

export async function uploadToGCS(file: File): Promise<string> {
  const bucketName = process.env.GCS_BUCKET_NAME;

  if (!bucketName) {
    throw new Error('GCS_BUCKET_NAME is not defined in environment variables');
  }

  const gcsStorage = getStorage();
  const bucket = gcsStorage.bucket(bucketName);

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
  const gcsFile = bucket.file(fileName);

  await gcsFile.save(buffer, {
    metadata: {
      contentType: file.type,
    },
  });

  // Return the public URL
  return `https://storage.googleapis.com/${bucketName}/${fileName}`;
}
