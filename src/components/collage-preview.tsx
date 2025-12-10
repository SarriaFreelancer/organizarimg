
"use client";

import React, { useEffect, useRef, useMemo, forwardRef, useImperativeHandle, useState } from 'react';
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
  getCanvasDataUrl: (pageIndex: number) => string | null;
}

// A4 Landscape at 96 DPI. 27cm x 18.8cm content area.
const CANVAS_WIDTH = 1021; // (27 / 2.54) * 96
const CANVAS_HEIGHT = 711; // (18.8 / 2.54) * 96

const drawPage = (
  ctx: CanvasRenderingContext2D,
  imagesForPage: HTMLImageElement[],
  layout: LayoutOptions,
  pageNumber: number,
  timestamp: string | null
) => {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const cols = layout === 2 ? 2 : (layout === 4 ? 2 : 3);
  const rows = layout === 2 ? 1 : 2;
  const gap = 12;
  const leftPad = 20;
  const topPad = 20;
  const rightPad = 20;
  const bottomPad = 40;

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
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y + 0.5, cellW - 1, cellH - 1);

      const titleHeight = 28;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x, y, cellW, titleHeight);
      ctx.strokeStyle = '#444';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(x + 0.5, y + 0.5, cellW - 1, titleHeight - 1);
      ctx.fillStyle = '#111827';
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(`Registro Fotográfico N°${imageIndexInAll + 1}`, x + 9, y + titleHeight / 2);

      const imgContainerY = y + titleHeight;
      const imgContainerH = cellH - titleHeight;

      if (img && img.complete && img.naturalWidth > 0) {
        drawImageCover(ctx, img, x, imgContainerY, cellW, imgContainerH);
      } else {
        drawPlaceholder(ctx, x, imgContainerY, cellW, imgContainerH, `Imagen ${imageIndexInAll + 1}`);
      }
      
      if (timestamp) {
        ctx.font = '8px Inter, sans-serif';
        const tsW = ctx.measureText(timestamp).width + 8;
        const tsH = 12;
        const tsX = x + cellW - tsW - 6;
        const tsY = y + cellH - tsH - 6;
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        roundRect(ctx, tsX, tsY, tsW, tsH, 3, true, false);
        ctx.fillStyle = 'rgba(255,255,255,0.95)';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(timestamp, tsX + 4, tsY + tsH / 2);
      }
    }
  }

  ctx.fillStyle = '#111827';
  ctx.font = '12px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Mosaico de Fotos - Generado', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 15);
};

const CollagePreview = forwardRef<CollagePreviewHandles, CollagePreviewProps>(
  ({ images, layout, currentPage, onPageChange }, ref) => {
    const totalPages = Math.max(1, Math.ceil(images.length / layout));
    const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
    const [api, setApi] = useState<CarouselApi>();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const pages = useMemo(() => {
      const pageData = [];
      for (let i = 0; i < totalPages; i++) {
        const startIndex = i * layout;
        const endIndex = startIndex + layout;
        pageData.push(images.slice(startIndex, endIndex));
      }
      return pageData;
    }, [images, layout, totalPages]);

    useImperativeHandle(ref, () => ({
      getCanvasDataUrl: (pageIndex: number) => {
        const canvas = canvasRefs.current[pageIndex];
        if (!canvas) return null;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
            const timestamp = new Date().toLocaleString('es-ES');
            const imagesForPage = pages[pageIndex] || [];
            drawPage(ctx, imagesForPage, layout, pageIndex, timestamp);
        }

        return canvas.toDataURL('image/png');
      }
    }));

    useEffect(() => {
      if (!isClient) return;

      pages.forEach((imagesForPage, i) => {
        const canvas = canvasRefs.current[i];
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            // Passing null for timestamp, it will be added on download
            drawPage(ctx, imagesForPage, layout, i, null);
          }
        }
      });
    }, [pages, layout, images, isClient]);

    useEffect(() => {
      if (!api) return;
      
      const handleSelect = () => onPageChange(api.selectedScrollSnap());
      const handleReinit = () => {
         if (api.selectedScrollSnap() !== currentPage) {
          api.scrollTo(currentPage, true);
         }
      }

      api.on("select", handleSelect);
      api.on("reInit", handleReinit);

      if (api.selectedScrollSnap() !== currentPage) {
        api.scrollTo(currentPage, true);
      }

      return () => {
        api.off("select", handleSelect);
        api.off("reInit", handleReinit);
      }
    }, [api, onPageChange, currentPage]);

    useEffect(() => {
      if (api && api.selectedScrollSnap() !== currentPage) {
        api.scrollTo(currentPage, true);
      }
    }, [currentPage, api]);

    const placeholder = (
        <Card className="aspect-[1021/711] w-full flex items-center justify-center bg-muted/50 border-dashed">
          <div className="text-center text-muted-foreground">
              <h3 className="font-headline text-2xl mb-2">Sube fotos para empezar</h3>
              <p>Tu hermoso collage aparecerá aquí.</p>
          </div>
        </Card>
      );
    
    if (!isClient || images.length === 0) {
      return placeholder;
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
                    className="w-full h-auto aspect-[1021/711]"
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

  