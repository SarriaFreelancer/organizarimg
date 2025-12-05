"use client";

import React, { useEffect, useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { cn, drawImageCover, drawPlaceholder, roundRect } from '@/lib/utils';

type LayoutOptions = 2 | 4 | 6;

interface CollagePreviewProps {
  images: HTMLImageElement[];
  layout: LayoutOptions;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export interface CollagePreviewHandles {
  getCanvases: () => (HTMLCanvasElement | null)[];
}

const CANVAS_WIDTH = 2480;
const CANVAS_HEIGHT = 1754;

const drawPage = (
  ctx: CanvasRenderingContext2D,
  imagesForPage: HTMLImageElement[],
  layout: LayoutOptions,
  pageNumber: number
) => {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const cols = layout === 2 ? 2 : (layout === 4 ? 2 : 3);
  const rows = layout === 2 ? 1 : 2;
  const gap = 24;
  const leftPad = 42;
  const topPad = 40;
  const rightPad = 42;
  const bottomPad = 80;

  const gridW = CANVAS_WIDTH - leftPad - rightPad;
  const gridH = CANVAS_HEIGHT - topPad - bottomPad;

  const cellW = Math.floor((gridW - gap * (cols - 1)) / cols);
  const cellH = Math.floor((gridH - gap * (rows - 1)) / rows);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      if (i >= layout) continue;
      
      const imageIndexInAll = pageNumber * layout + i;
      const img = imagesForPage[i];
      
      const x = leftPad + c * (cellW + gap);
      const y = topPad + r * (cellH + gap);
      
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x, y, cellW, cellH);
      ctx.strokeStyle = '#bdbdbd';
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 0.5, y + 0.5, cellW - 1, cellH - 1);

      const titleHeight = 56;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x, y, cellW, titleHeight);
      ctx.strokeStyle = '#444';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y + 0.5, cellW - 1, titleHeight - 1);
      ctx.fillStyle = '#111827';
      ctx.font = '22px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(`Registro Fotográfico N°${imageIndexInAll + 1}`, x + 18, y + titleHeight / 2);

      const imgContainerY = y + titleHeight;
      const imgContainerH = cellH - titleHeight;

      if (img && img.complete && img.naturalWidth > 0) {
        drawImageCover(ctx, img, x, imgContainerY, cellW, imgContainerH);
      } else {
        drawPlaceholder(ctx, x, imgContainerY, cellW, imgContainerH, `Imagen ${imageIndexInAll + 1}`);
      }

      const now = new Date();
      const ts = now.toLocaleString('es-ES');
      ctx.font = '16px Inter, sans-serif';
      const tsW = ctx.measureText(ts).width + 16;
      const tsH = 24;
      const tsX = x + cellW - tsW - 12;
      const tsY = y + cellH - tsH - 12;
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      roundRect(ctx, tsX, tsY, tsW, tsH, 6, true, false);
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(ts, tsX + 8, tsY + tsH / 2);
    }
  }

  ctx.fillStyle = '#111827';
  ctx.font = '24px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Photo Mosaic - Generado', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 30);
};

const CollagePreview = forwardRef<CollagePreviewHandles, CollagePreviewProps>(
  ({ images, layout, currentPage, onPageChange }, ref) => {
    const totalPages = Math.max(1, Math.ceil(images.length / layout));
    const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
    const [api, setApi] = React.useState<CarouselApi>();

    useImperativeHandle(ref, () => ({
      getCanvases: () => canvasRefs.current.filter(c => c !== null),
    }));

    const pages = useMemo(() => {
      const pageData = [];
      for (let i = 0; i < totalPages; i++) {
        const startIndex = i * layout;
        const endIndex = startIndex + layout;
        pageData.push(images.slice(startIndex, endIndex));
      }
      return pageData;
    }, [images, layout, totalPages]);

    useEffect(() => {
      pages.forEach((imagesForPage, i) => {
        const canvas = canvasRefs.current[i];
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            drawPage(ctx, imagesForPage, layout, i);
          }
        }
      });
    }, [pages, layout, images]);

    useEffect(() => {
      if (!api) return;
      api.on("select", () => {
        onPageChange(api.selectedScrollSnap());
      });
      api.on("reInit", () => {
         if (api.selectedScrollSnap() !== currentPage) {
          api.scrollTo(currentPage, true);
         }
      });
    }, [api, onPageChange, currentPage]);

    useEffect(() => {
      if (api && api.selectedScrollSnap() !== currentPage) {
        api.scrollTo(currentPage, true);
      }
    }, [currentPage, api]);

    if (images.length === 0) {
      return (
        <Card className="aspect-[1.414/1] w-full flex items-center justify-center bg-muted/50 border-dashed">
          <div className="text-center text-muted-foreground">
              <h3 className="font-headline text-2xl mb-2">Upload photos to begin</h3>
              <p>Your beautiful collage will appear here.</p>
          </div>
        </Card>
      );
    }

    return (
      <Carousel setApi={setApi} className="w-full">
        <CarouselContent>
          {pages.map((_, index) => (
            <CarouselItem key={index}>
              <Card className="shadow-lg overflow-hidden">
                <CardContent className="p-0">
                  <canvas
                    ref={el => canvasRefs.current[index] = el}
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    className="w-full h-auto aspect-[2480/1754]"
                  />
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    );
  }
);
CollagePreview.displayName = "CollagePreview";

export default CollagePreview;
