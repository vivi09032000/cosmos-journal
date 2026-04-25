const MAX_WIDTH = 1200;
const TARGET_MAX_BYTES = 1024 * 1024;
const OUTPUT_QUALITY = 0.75;
const OUTPUT_TYPE = "image/webp";

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("圖片讀取失敗，請重新選擇檔案。"));
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

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("圖片壓縮失敗，請換一張圖片再試一次。"));
        return;
      }

      resolve(blob);
    }, type, quality);
  });
}

export async function prepareImageForUpload(file) {
  if (!file || typeof window === "undefined") {
    throw new Error("找不到可上傳的圖片檔案。");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("只支援上傳圖片檔案。");
  }

  const image = await loadImageFromFile(file);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("圖片壓縮失敗，瀏覽器目前無法處理這張圖片。");
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

    blob = await canvasToBlob(canvas, OUTPUT_TYPE, OUTPUT_QUALITY);

    if (blob.size <= TARGET_MAX_BYTES) {
      break;
    }

    scale *= 0.85;
  }

  if (!blob) {
    throw new Error("圖片壓縮失敗，請重新選擇圖片。");
  }

  if (blob.size > TARGET_MAX_BYTES) {
    throw new Error("圖片壓縮後仍超過 1MB，請換一張較小的圖片。");
  }

  const originalName = file.name.replace(/\.[^.]+$/, "");

  return new File([blob], `${originalName}.webp`, {
    type: OUTPUT_TYPE,
    lastModified: Date.now(),
  });
}
