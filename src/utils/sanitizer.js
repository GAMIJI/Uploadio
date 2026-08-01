const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

export const validateAndSanitizeImageFile = (file) => {
  if (!file) {
    throw new Error("No file provided for upload.");
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error(`Invalid file format (${file.type}). Only JPEG, PNG, WebP, and AVIF are supported.`);
  }

  const maxBytes = 25 * 1024 * 1024; // 25MB maximum limit
  if (file.size > maxBytes) {
    throw new Error("File size exceeds the limit of 25MB.");
  }

  return true;
};