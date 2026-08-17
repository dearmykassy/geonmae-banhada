const PERMILLE_SCALE = 1000;

function integer(value, name) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`GEONMAE_T4_FOCAL_CROP_${name}`);
  }
  return value;
}

function permille(value, name) {
  if (!Number.isInteger(value) || value < 0 || value > PERMILLE_SCALE) {
    throw new Error(`GEONMAE_T4_FOCAL_CROP_${name}`);
  }
  return value;
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function calculateFocalCoverExtraction({
  sourceWidth,
  sourceHeight,
  targetWidth,
  targetHeight,
  xPermille = 500,
  yPermille = 500,
}) {
  integer(sourceWidth, "SOURCE_WIDTH");
  integer(sourceHeight, "SOURCE_HEIGHT");
  integer(targetWidth, "TARGET_WIDTH");
  integer(targetHeight, "TARGET_HEIGHT");
  permille(xPermille, "X_PERMILLE");
  permille(yPermille, "Y_PERMILLE");

  const sourceAspect = sourceWidth / sourceHeight;
  const targetAspect = targetWidth / targetHeight;
  let width;
  let height;
  if (sourceAspect > targetAspect) {
    height = sourceHeight;
    width = Math.min(sourceWidth, Math.round(sourceHeight * targetAspect));
  } else {
    width = sourceWidth;
    height = Math.min(sourceHeight, Math.round(sourceWidth / targetAspect));
  }

  const requestedCenterX = sourceWidth * xPermille / PERMILLE_SCALE;
  const requestedCenterY = sourceHeight * yPermille / PERMILLE_SCALE;
  const left = Math.round(clamp(requestedCenterX - width / 2, 0, sourceWidth - width));
  const top = Math.round(clamp(requestedCenterY - height / 2, 0, sourceHeight - height));

  return {
    left,
    top,
    width,
    height,
    requestedFocalPoint: { xPermille, yPermille },
    appliedCenter: {
      xPermille: Math.round((left + width / 2) / sourceWidth * PERMILLE_SCALE),
      yPermille: Math.round((top + height / 2) / sourceHeight * PERMILLE_SCALE),
    },
  };
}

export function validateFocalPointDocument(document, expectedAssetIds) {
  if (
    document?.schemaVersion !== "geonmae-banhada-template4-regional-focal-points/v1" ||
    document?.status !== "PROPOSED_FOCAL_CROP_METADATA" ||
    document?.platformKey !== "geonmae-banhada" ||
    document?.profile !== "mobile" ||
    document?.derivative?.width !== 768 ||
    document?.derivative?.height !== 600 ||
    document?.derivative?.fit !== "cover" ||
    !Array.isArray(document?.consumerCovers) ||
    document.consumerCovers.length !== 2 ||
    document.consumerCovers[0]?.name !== "mobile-390" ||
    document.consumerCovers[0]?.viewportWidth !== 390 ||
    document.consumerCovers[0]?.viewportHeight !== 620 ||
    document.consumerCovers[0]?.position !== "center top" ||
    document.consumerCovers[1]?.name !== "mobile-320" ||
    document.consumerCovers[1]?.viewportWidth !== 320 ||
    document.consumerCovers[1]?.viewportHeight !== 620 ||
    document.consumerCovers[1]?.position !== "center top" ||
    document?.coordinateScale !== PERMILLE_SCALE
  ) {
    throw new Error("GEONMAE_T4_FOCAL_CROP_DOCUMENT_CONTRACT");
  }

  permille(document.defaultFocalPoint?.xPermille, "DEFAULT_X_PERMILLE");
  permille(document.defaultFocalPoint?.yPermille, "DEFAULT_Y_PERMILLE");
  const expected = new Set(expectedAssetIds);
  const overrides = new Map();
  for (const entry of document.overrides ?? []) {
    if (!expected.has(entry.assetId) || overrides.has(entry.assetId)) {
      throw new Error(`GEONMAE_T4_FOCAL_CROP_OVERRIDE:${entry.assetId}`);
    }
    permille(entry.xPermille, `OVERRIDE_X:${entry.assetId}`);
    permille(entry.yPermille, `OVERRIDE_Y:${entry.assetId}`);
    overrides.set(entry.assetId, {
      xPermille: entry.xPermille,
      yPermille: entry.yPermille,
    });
  }
  return {
    defaultFocalPoint: document.defaultFocalPoint,
    overrides,
  };
}

export function getAssetFocalPoint(validatedDocument, assetId) {
  return validatedDocument.overrides.get(assetId) ?? validatedDocument.defaultFocalPoint;
}
