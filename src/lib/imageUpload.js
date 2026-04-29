const MAX_WIDTH = 1200;
const TARGET_MAX_BYTES = 1024 * 1024;
const OUTPUT_QUALITY = 0.75;
const OUTPUT_TYPE = "image/webp";

function getImageUploadCopy(locale) {
  if (locale === "en") {
    return {
      fileReadFailed: "Failed to read the image. Please choose the file again.",
      blobFailed: "Image compression failed. Please try another image.",
      missingFile: "No image file was found to upload.",
      invalidType: "Only image files are supported.",
      browserUnsupported: "Image compression failed because this browser cannot process the image.",
      compressionFailed: "Image compression failed. Please choose the image again.",
      tooLarge: "The compressed image is still over 1MB. Please choose a smaller image.",
    };
  }

  return {
    fileReadFailed: "圖片讀取失敗，請重新選擇檔案。",
    blobFailed: "圖片壓縮失敗，請換一張圖片再試一次。",
    missingFile: "找不到可上傳的圖片檔案。",
    invalidType: "只支援上傳圖片檔案。",
    browserUnsupported: "圖片壓縮失敗，瀏覽器目前無法處理這張圖片。",
    compressionFailed: "圖片壓縮失敗，請重新選擇圖片。",
    tooLarge: "圖片壓縮後仍超過 1MB，請換一張較小的圖片。",
  };
}

function loadImageFromFile(file, copy) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(copy.fileReadFailed));
    };

    image.src = objectUrl;
  });
}

function getTargetDimensions(width, height, scale = 1) {
  const cappedWidth = Math.min(width, MAX_WIDTH);
  const ratio = cappedWidth / width;
  const baseWidth = Math.round(width * ratio * scale);
  const baseHeight = Math.round(height * ratio * scale);

  return {
    width: Math.max(1, baseWidth),
    height: Math.max(1, baseHeight),
  };
}

function canvasToBlob(canvas, type, quality, copy) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error(copy.blobFailed));
        return;
      }

      resolve(blob);
    }, type, quality);
  });
}

export async function prepareImageForUpload(file, locale = "zh-TW") {
  const copy = getImageUploadCopy(locale);

  if (!file || typeof window === "undefined") {
    throw new Error(copy.missingFile);
  }

  if (!file.type.startsWith("image/")) {
    throw new Error(copy.invalidType);
  }

  const image = await loadImageFromFile(file, copy);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error(copy.browserUnsupported);
  }

  let scale = 1;
  let blob = null;

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const { width, height } = getTargetDimensions(
      image.naturalWidth,
      image.naturalHeight,
      scale,
    );

    canvas.width = width;
    canvas.height = height;
    context.clearRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    blob = await canvasToBlob(canvas, OUTPUT_TYPE, OUTPUT_QUALITY, copy);

    if (blob.size <= TARGET_MAX_BYTES) {
      break;
    }

    scale *= 0.85;
  }

  if (!blob) {
    throw new Error(copy.compressionFailed);
  }

  if (blob.size > TARGET_MAX_BYTES) {
    throw new Error(copy.tooLarge);
  }

  const originalName = file.name.replace(/\.[^.]+$/, "");

  return new File([blob], `${originalName}.webp`, {
    type: OUTPUT_TYPE,
    lastModified: Date.now(),
  });
}
