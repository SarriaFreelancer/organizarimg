import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function drawImageCover(
  ctx: CanvasRenderingContext2D, 
  img: HTMLImageElement, 
  destX: number, 
  destY: number, 
  destW: number, 
  destH: number
) {
  const iw = img.width;
  const ih = img.height;
  const destRatio = destW / destH;
  const imgRatio = iw / ih;

  let sx, sy, sWidth, sHeight;
  if(imgRatio > destRatio){
    sHeight = ih;
    sWidth = ih * destRatio;
    sx = (iw - sWidth) / 2;
    sy = 0;
  } else {
    sWidth = iw;
    sHeight = iw / destRatio;
    sx = 0;
    sy = (ih - sHeight) / 2;
  }
  ctx.drawImage(img, sx, sy, sWidth, sHeight, destX, destY, destW, destH);
}


export function drawPlaceholder(
  ctx: CanvasRenderingContext2D,
  cellX: number,
  cellY: number,
  w: number,
  h: number,
  text: string
) {
  ctx.fillStyle = '#f3f4f6';
  ctx.fillRect(cellX, cellY, w, h);
  ctx.fillStyle = '#9ca3af';
  ctx.font = '48px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, cellX + w / 2, cellY + h / 2);
}

type Radius = { tl: number; tr: number; br: number; bl: number };
export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number | Radius,
  fill: boolean,
  stroke: boolean
) {
  if (typeof stroke === 'undefined') stroke = true;
  if (typeof radius === 'undefined') radius = 5;
  
  let cornerRadius: Radius;
  if (typeof radius === 'number') {
    cornerRadius = { tl: radius, tr: radius, br: radius, bl: radius };
  } else {
    const defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 };
    cornerRadius = { ...defaultRadius, ...radius };
  }

  ctx.beginPath();
  ctx.moveTo(x + cornerRadius.tl, y);
  ctx.lineTo(x + width - cornerRadius.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + cornerRadius.tr);
  ctx.lineTo(x + width, y + height - cornerRadius.br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - cornerRadius.br, y + height);
  ctx.lineTo(x + cornerRadius.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - cornerRadius.bl);
  ctx.lineTo(x, y + cornerRadius.tl);
  ctx.quadraticCurveTo(x, y, x + cornerRadius.tl, y);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}
