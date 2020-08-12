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
