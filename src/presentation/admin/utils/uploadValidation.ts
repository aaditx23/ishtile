export const MAX_IMAGE_UPLOAD_BYTES = Math.floor(1.5 * 1024 * 1024);
export const MAX_IMAGE_UPLOAD_LABEL = '1.5MB';

export function splitFilesByUploadLimit(files: File[], maxBytes = MAX_IMAGE_UPLOAD_BYTES) {
  const accepted: File[] = [];
  const rejected: File[] = [];

  for (const file of files) {
    if (file.size <= maxBytes) accepted.push(file);
    else rejected.push(file);
  }

  return { accepted, rejected };
}

export function buildUploadSizeError(files: File[], maxLabel = MAX_IMAGE_UPLOAD_LABEL): string {
  if (files.length <= 1) {
    const fileName = files[0]?.name ?? 'Selected file';
    return `${fileName} exceeds the max upload size of ${maxLabel}.`;
  }

  return `${files.length} files exceed the max upload size of ${maxLabel}.`;
}
