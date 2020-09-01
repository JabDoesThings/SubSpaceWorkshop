export const drawAspect = (src: CanvasImageSource, dst: HTMLCanvasElement, sx: number = 0, sy: number = 0, sw: number = -1, sh: number = -1): void => {
  const srcW = <number> src.width;
  const srcH = <number> src.height;
  const dstW = <number> dst.width;
  const dstH = <number> dst.height;
  let dx = 0;
  let dy = 0;
  let dw = dstW;
  let dh = dstH;
  if (sw === -1) {
    sw = <number> srcW;
  }
  if (sh === -1) {
    sh = <number> srcH;
  }

  // Resize the destination dimensions to fit the destination canvas, maintaining the aspect ratio of the
  //   source.
  const ar = sw / sh;
  if (sw > sh) {
    dh = Math.floor(dh / ar);
    dy = Math.floor((dstH - dh) / 2);
  } else if (sw < sh) {
    dw = Math.floor(dw * ar);
    dx = Math.floor((dstW - dw) / 2);
  }

  dst.getContext('2d').drawImage(src, sx, sy, sw, sh, dx, dy, dw, dh);
};

export const clearCanvas = (
  canvas: HTMLCanvasElement, color: string = 'transparent', dims: { w: number, h: number } | null = null
): void => {
  if (dims == null) {
    dims = {w: canvas.width, h: canvas.height};
  }
  canvas.width = dims.w;
  canvas.height = dims.h;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
};

export const projectCanvasToCanvas = (
  src: HTMLCanvasElement,
  dst: HTMLCanvasElement,
  srcDims: { x: number, y: number, w: number, h: number } | null = null,
  dstDims: { x: number, y: number, w: number, h: number } | null = null,
  globalAlpha: number = 1
): void => {
  if (srcDims == null) {
    srcDims = {x: 0, y: 0, w: src.width, h: src.height};
  }
  if (dstDims == null) {
    dstDims = {x: 0, y: 0, w: dst.width, h: dst.height};
  }
  const ctx = dst.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.imageSmoothingQuality = 'low';
  const prevGlobalAlpha = ctx.globalAlpha;
  ctx.globalAlpha = globalAlpha;
  ctx.drawImage(src,
    srcDims.x, srcDims.y, srcDims.w, srcDims.h,
    dstDims.x, dstDims.y, dstDims.w, dstDims.h
  );
  ctx.globalAlpha = prevGlobalAlpha;
};

export const renderGrid = (canvas: HTMLCanvasElement, scale: number = 1): void => {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  const drawHLine = (x1: number, x2: number, y: number): void => {
    ctx.moveTo(x1 - 0.5, y - 0.5);
    ctx.lineTo(x2 - 0.5, y - 0.5);
  };

  const drawVLine = (x: number, y1: number, y2: number): void => {
    ctx.moveTo(x - 0.5, y1 - 0.5);
    ctx.lineTo(x - 0.5, y2 - 0.5);
  };

  const drawGrid = (color: string, pixelLength: number = 1, lineWidth: number = 1): void => {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    for (let y = 0; y < h; y += scale * pixelLength) {
      drawHLine(0, w, y);
    }
    for (let x = 0; x < w; x += scale * pixelLength) {
      drawVLine(x, 0, h);
    }
    ctx.stroke();
  };

  drawGrid('rgba(127,127,127,0.5)');
  drawGrid('rgba(255, 0, 0, 0.5)', 16);
};
